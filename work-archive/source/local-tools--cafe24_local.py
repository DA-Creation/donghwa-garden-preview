#!/usr/bin/env python3
import argparse
import base64
import json
import os
import secrets
import sys
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
TOKEN_PATH = ROOT / ".tokens.json"
STATE_PATH = ROOT / ".oauth-state.json"
TOKEN_REFRESH_MARGIN_SECONDS = 5 * 60


class Cafe24Error(RuntimeError):
    def __init__(self, status, message, details=""):
        super().__init__(message)
        self.status = status
        self.details = details


def load_env(path=ENV_PATH):
    values = {}
    if path.exists():
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    values.update({key: value for key, value in os.environ.items() if key.startswith("CAFE24_")})
    return values


def require_config(env, *keys):
    missing = [key for key in keys if not env.get(key)]
    if missing:
        raise SystemExit(f"설정이 필요합니다: {', '.join(missing)}")


def api_base(env):
    return f"https://{env['CAFE24_MALL_ID']}.cafe24api.com/api/v2"


def shop_no(env):
    return int(env.get("CAFE24_SHOP_NO", "1"))


def write_private_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    os.chmod(path, 0o600)


def parse_iso_date(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def token_is_expiring(token):
    expires_at = parse_iso_date(token.get("expires_at"))
    if not expires_at:
        return True
    return (expires_at - datetime.now(timezone.utc)).total_seconds() <= TOKEN_REFRESH_MARGIN_SECONDS


def request_json(method, url, headers=None, payload=None):
    body = None
    request_headers = dict(headers or {})
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request_headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=body, headers=request_headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read().decode("utf-8")
            return (json.loads(text) if text else {}), dict(response.headers)
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        try:
            message = json.loads(details).get("error", {}).get("message") or details
        except json.JSONDecodeError:
            message = details
        raise Cafe24Error(error.code, message or error.reason, details) from error


def request_form(url, headers, payload):
    request = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(payload).encode("utf-8"),
        headers={**headers, "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise Cafe24Error(error.code, "Cafe24 토큰 요청에 실패했습니다.", details) from error


def basic_auth(env):
    require_config(env, "CAFE24_CLIENT_ID", "CAFE24_CLIENT_SECRET")
    raw = f"{env['CAFE24_CLIENT_ID']}:{env['CAFE24_CLIENT_SECRET']}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def build_auth_url(env, state=None):
    require_config(env, "CAFE24_MALL_ID", "CAFE24_CLIENT_ID", "CAFE24_REDIRECT_URI", "CAFE24_SCOPES")
    state = state or secrets.token_urlsafe(24)
    query = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": env["CAFE24_CLIENT_ID"],
            "state": state,
            "redirect_uri": env["CAFE24_REDIRECT_URI"],
            "scope": env["CAFE24_SCOPES"],
        },
        quote_via=urllib.parse.quote,
    )
    return f"{api_base(env)}/oauth/authorize?{query}", state


def save_oauth_state(state):
    write_private_json(
        STATE_PATH,
        {"state": state, "created_at": datetime.now(timezone.utc).isoformat()},
    )


def extract_callback(value):
    parsed = urllib.parse.urlparse(value.strip())
    if parsed.scheme not in {"http", "https"}:
        raise SystemExit("인증 후 이동한 페이지의 전체 주소를 붙여넣어 주세요.")
    params = urllib.parse.parse_qs(parsed.query)
    code = (params.get("code") or [""])[0]
    state = (params.get("state") or [""])[0]
    if not code:
        raise SystemExit("주소에서 Cafe24 인증 코드를 찾지 못했습니다.")
    if not state:
        raise SystemExit("주소에서 OAuth 상태값을 찾지 못했습니다.")
    return code, state


def validate_oauth_state(returned_state):
    if not STATE_PATH.exists():
        raise SystemExit("저장된 OAuth 상태값이 없습니다. auth-url을 다시 실행해 주세요.")
    saved = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    if not secrets.compare_digest(str(saved.get("state", "")), str(returned_state)):
        raise SystemExit("OAuth 상태값이 일치하지 않습니다. 인증을 중단했습니다.")


def save_tokens(tokens):
    write_private_json(TOKEN_PATH, tokens)
    STATE_PATH.unlink(missing_ok=True)


def load_tokens():
    if not TOKEN_PATH.exists():
        raise SystemExit("저장된 토큰이 없습니다. auth-url과 token 명령을 먼저 실행해 주세요.")
    return json.loads(TOKEN_PATH.read_text(encoding="utf-8"))


def exchange_code(env, callback_url):
    require_config(env, "CAFE24_MALL_ID", "CAFE24_CLIENT_ID", "CAFE24_CLIENT_SECRET", "CAFE24_REDIRECT_URI")
    code, returned_state = extract_callback(callback_url)
    validate_oauth_state(returned_state)
    tokens = request_form(
        f"{api_base(env)}/oauth/token",
        {"Authorization": basic_auth(env)},
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": env["CAFE24_REDIRECT_URI"],
        },
    )
    save_tokens(tokens)
    return tokens


def refresh_tokens(env, current=None):
    current = current or load_tokens()
    if not current.get("refresh_token"):
        raise SystemExit("Refresh Token이 없습니다. OAuth 인증을 다시 진행해 주세요.")
    tokens = request_form(
        f"{api_base(env)}/oauth/token",
        {"Authorization": basic_auth(env)},
        {"grant_type": "refresh_token", "refresh_token": current["refresh_token"]},
    )
    merged = {**current, **tokens}
    save_tokens(merged)
    return merged


def auth_headers(env, token):
    return {
        "Authorization": f"Bearer {token['access_token']}",
        "X-Cafe24-Api-Version": env.get("CAFE24_API_VERSION", "2026-03-01"),
    }


def api_request(env, method, path, payload=None, query=None, retry=True):
    token = load_tokens()
    if token_is_expiring(token):
        token = refresh_tokens(env, token)
    query_string = f"?{urllib.parse.urlencode(query)}" if query else ""
    url = f"{api_base(env)}{path}{query_string}"
    try:
        return request_json(method, url, headers=auth_headers(env, token), payload=payload)
    except Cafe24Error as error:
        if retry and error.status == 401:
            refresh_tokens(env, token)
            return api_request(env, method, path, payload=payload, query=query, retry=False)
        raise


def print_json(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))


def load_json_file(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def normalized_product(env, source, description_html=None):
    request = dict(source.get("request", source))
    if description_html:
        html = Path(description_html).read_text(encoding="utf-8")
        request["description"] = html
        request["mobile_description"] = html
    request.setdefault("shop_no", shop_no(env))
    request.setdefault("display", "F")
    request.setdefault("selling", "F")
    for field in ("product_name", "price", "supply_price"):
        if request.get(field) in {None, ""}:
            raise SystemExit(f"상품 등록값에 {field}이(가) 필요합니다.")
    return request


def normalized_review(env, source, board_no, client_ip):
    request = dict(source.get("request", source))
    request.setdefault("shop_no", shop_no(env))
    request.setdefault("client_ip", client_ip)
    request.setdefault("input_channel", "P")
    for field in ("product_no", "writer", "title", "content", "rating"):
        if request.get(field) in {None, ""}:
            raise SystemExit(f"리뷰 등록값에 {field}이(가) 필요합니다.")
    rating = int(request["rating"])
    if not 1 <= rating <= 5:
        raise SystemExit("리뷰 별점은 1점부터 5점까지 입력할 수 있습니다.")
    request["rating"] = rating
    return int(board_no), request


def preview_request(kind, endpoint, request):
    safe = dict(request)
    for field in ("description", "mobile_description", "content"):
        if field in safe:
            safe[field] = f"[본문 {len(str(request[field]).encode('utf-8'))} bytes]"
    print_json({"dry_run": True, "kind": kind, "endpoint": endpoint, "request": safe})


def cmd_auth_url(args):
    env = load_env()
    url, state = build_auth_url(env)
    save_oauth_state(state)
    print("Cafe24 운영자 승인 주소를 열었습니다.")
    print("승인 후 이동한 페이지의 전체 주소를 token 명령에 붙여넣으세요.")
    if args.open:
        webbrowser.open(url)
    else:
        print(url)


def cmd_token(args):
    tokens = exchange_code(load_env(), args.callback_url)
    print_json(
        {
            "saved": True,
            "mall_id": tokens.get("mall_id"),
            "user_id": tokens.get("user_id"),
            "expires_at": tokens.get("expires_at"),
            "scopes": tokens.get("scopes"),
        }
    )


def cmd_status(args):
    token = load_tokens()
    print_json(
        {
            "mall_id": token.get("mall_id"),
            "user_id": token.get("user_id"),
            "expires_at": token.get("expires_at"),
            "refresh_token_expires_at": token.get("refresh_token_expires_at"),
            "expiring": token_is_expiring(token),
            "scopes": token.get("scopes"),
        }
    )


def cmd_refresh(args):
    tokens = refresh_tokens(load_env())
    print_json({"refreshed": True, "expires_at": tokens.get("expires_at")})


def cmd_verify(args):
    env = load_env()
    products, _ = api_request(
        env,
        "GET",
        "/admin/products",
        query={"shop_no": shop_no(env), "limit": 10, "fields": "product_no,product_name,price,display,selling"},
    )
    boards, _ = api_request(env, "GET", "/admin/boards", query={"shop_no": shop_no(env)})
    print_json(
        {
            "connected": True,
            "mall_id": env["CAFE24_MALL_ID"],
            "products_read": len(products.get("products", [])),
            "boards_read": len(boards.get("boards", [])),
        }
    )


def cmd_list_products(args):
    env = load_env()
    data, _ = api_request(
        env,
        "GET",
        "/admin/products",
        query={
            "shop_no": shop_no(env),
            "limit": min(max(args.limit, 1), 100),
            "fields": "product_no,product_code,product_name,price,display,selling",
        },
    )
    print_json(data)


def cmd_create_product(args):
    env = load_env()
    request = normalized_product(env, load_json_file(args.json_file), args.description_html)
    endpoint = "/admin/products"
    if not args.commit:
        preview_request("product", endpoint, request)
        return
    data, _ = api_request(
        env,
        "POST",
        endpoint,
        payload={"shop_no": shop_no(env), "request": request},
    )
    print_json(data)


def cmd_list_boards(args):
    env = load_env()
    data, _ = api_request(env, "GET", "/admin/boards", query={"shop_no": shop_no(env)})
    print_json(data)


def cmd_list_reviews(args):
    env = load_env()
    query = {"shop_no": shop_no(env), "limit": min(max(args.limit, 1), 100)}
    if args.product_no:
        query["product_no"] = args.product_no
    data, _ = api_request(env, "GET", f"/admin/boards/{args.board_no}/articles", query=query)
    print_json(data)


def cmd_create_review(args):
    env = load_env()
    board_no, request = normalized_review(
        env,
        load_json_file(args.json_file),
        args.board_no,
        args.client_ip,
    )
    endpoint = f"/admin/boards/{board_no}/articles"
    if not args.commit:
        preview_request("review", endpoint, request)
        return
    data, _ = api_request(
        env,
        "POST",
        endpoint,
        payload={"shop_no": shop_no(env), "requests": [request]},
    )
    print_json(data)


def build_parser():
    parser = argparse.ArgumentParser(description="동화가든 Cafe24 로컬 OAuth·상품·리뷰 도구")
    commands = parser.add_subparsers(required=True)

    auth = commands.add_parser("auth-url", help="Cafe24 운영자 승인 URL 생성")
    auth.add_argument("--open", action="store_true", help="기본 브라우저에서 승인 URL 열기")
    auth.set_defaults(func=cmd_auth_url)

    token = commands.add_parser("token", help="승인 후 돌아온 전체 URL로 토큰 발급")
    token.add_argument("callback_url")
    token.set_defaults(func=cmd_token)

    status = commands.add_parser("status", help="토큰 상태 확인")
    status.set_defaults(func=cmd_status)

    refresh = commands.add_parser("refresh", help="토큰 즉시 갱신")
    refresh.set_defaults(func=cmd_refresh)

    verify = commands.add_parser("verify", help="상품·게시판 읽기 권한 확인")
    verify.set_defaults(func=cmd_verify)

    products = commands.add_parser("list-products", help="상품 목록 조회")
    products.add_argument("--limit", type=int, default=20)
    products.set_defaults(func=cmd_list_products)

    create_product = commands.add_parser("create-product", help="상품 등록")
    create_product.add_argument("json_file")
    create_product.add_argument("--description-html")
    create_product.add_argument("--commit", action="store_true", help="실제 Cafe24에 등록")
    create_product.set_defaults(func=cmd_create_product)

    boards = commands.add_parser("list-boards", help="게시판 목록 조회")
    boards.set_defaults(func=cmd_list_boards)

    reviews = commands.add_parser("list-reviews", help="상품 후기 조회")
    reviews.add_argument("--board-no", type=int, default=4)
    reviews.add_argument("--product-no", type=int)
    reviews.add_argument("--limit", type=int, default=20)
    reviews.set_defaults(func=cmd_list_reviews)

    create_review = commands.add_parser("create-review", help="운영자용 상품 후기 등록")
    create_review.add_argument("json_file")
    create_review.add_argument("--board-no", type=int, default=4)
    create_review.add_argument("--client-ip", default="127.0.0.1")
    create_review.add_argument("--commit", action="store_true", help="실제 Cafe24에 등록")
    create_review.set_defaults(func=cmd_create_review)

    return parser


def main():
    args = build_parser().parse_args()
    try:
        args.func(args)
    except Cafe24Error as error:
        print(f"Cafe24 API 오류 ({error.status}): {error}", file=sys.stderr)
        if error.details:
            print(error.details, file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()

"""Read MP4 timing boxes only; no modifications, no network."""
import json, struct, sys
from pathlib import Path

def u32(b,o=0): return struct.unpack_from('>I',b,o)[0]
def u64(b,o=0): return struct.unpack_from('>Q',b,o)[0]
def boxes(b):
    p=0
    while p+8<=len(b):
        n,t=struct.unpack_from('>I4s',b,p);h=8
        if n==1:n=u64(b,p+8);h=16
        if n==0:n=len(b)-p
        if n<h or p+n>len(b):raise ValueError('Invalid MP4 box size')
        yield t.decode('ascii',errors='replace'),b[p+h:p+n]
        p+=n
def timing(b):
    return {'timescale':u32(b,20 if b[0]==1 else 12),'duration_ticks':u64(b,24) if b[0]==1 else u32(b,16)}
def inspect(path):
    result={'path':str(path),'tracks':[]}
    for t,b in boxes(path.read_bytes()):
        if t!='moov':continue
        for t,b in boxes(b):
            if t=='mvhd':result['movie']=timing(b)
            if t!='trak':continue
            track={};result['tracks'].append(track)
            for tt,bb in boxes(b):
                if tt=='tkhd':track['track_duration_ticks']=u64(bb,28) if bb[0]==1 else u32(bb,20)
                if tt=='edts':
                    for ttt,bbb in boxes(bb):
                        if ttt!='elst':continue
                        entries=[];off=8
                        for _ in range(u32(bbb,4)):
                            if bbb[0]==1:dur,media=struct.unpack_from('>Qq',bbb,off);off+=20
                            else:dur,media=struct.unpack_from('>Ii',bbb,off);off+=12
                            entries.append({'segment_duration_ticks':dur,'media_time_ticks':media})
                        track['edit_list']=entries
                if tt!='mdia':continue
                for ttt,bbb in boxes(bb):
                    if ttt=='mdhd':track['media']=timing(bbb)
                    if ttt=='hdlr':track['handler']=bbb[8:12].decode()
                    if ttt!='minf':continue
                    for t4,b4 in boxes(bbb):
                        if t4!='stbl':continue
                        for t5,b5 in boxes(b4):
                            if t5=='stts':track['stts']=[list(struct.unpack_from('>II',b5,8+i*8)) for i in range(u32(b5,4))]
                            if t5=='stsz':track['sample_count']=u32(b5,8)
                            if t5=='ctts':track['ctts']=[list(struct.unpack_from('>II',b5,8+i*8)) for i in range(u32(b5,4))]
    if 'movie' in result:result['movie']['seconds']=result['movie']['duration_ticks']/result['movie']['timescale']
    for track in result['tracks']:
        if 'media' in track:track['media']['seconds']=track['media']['duration_ticks']/track['media']['timescale']
        if 'stts' in track:track['stts_total_ticks']=sum(c*d for c,d in track['stts'])
    return result
if __name__=='__main__': print(json.dumps([inspect(Path(p)) for p in sys.argv[1:]],indent=2))

// Input normalization: keyboard and simple touch mapping
export const Input = {
  onMove: null, // handler(dx,dy)
  bindKeyboard(){
    window.addEventListener('keydown', (e)=>{
      let dx=0, dy=0;
      if(e.key==='ArrowUp' || e.key==='w' || e.key==='W') dy=-1;
      if(e.key==='ArrowDown' || e.key==='s' || e.key==='S') dy=1;
      if(e.key==='ArrowLeft' || e.key==='a' || e.key==='A') dx=-1;
      if(e.key==='ArrowRight' || e.key==='d' || e.key==='D') dx=1;
      if(dx!==0||dy!==0){ if(this.onMove) this.onMove(dx,dy); }
    });
  }
}

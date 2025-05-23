import React from 'react';

export default function LoadingBar({ duration, text }) {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    let start = Date.now();
    let raf;
    function animate() {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, (elapsed / duration) * 100);
      setProgress(percent);
      if (percent < 100) raf = requestAnimationFrame(animate);
    }
    animate();
    return () => raf && cancelAnimationFrame(raf);
  }, [duration]);
  return (
    <div style={{width:'100%', margin:'32px 0', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div style={{width:220, height:10, background:'#eee', borderRadius:8, overflow:'hidden', marginBottom:10}}>
        <div style={{width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#1a73e8,#3f51b5)', transition:'width 0.2s', borderRadius:8}} />
      </div>
      <span style={{color:'#1a73e8', fontWeight:600, fontSize:16}}>{text || 'Loading...'}</span>
    </div>
  );
}

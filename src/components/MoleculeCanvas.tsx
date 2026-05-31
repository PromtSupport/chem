import React, { useEffect, useRef } from 'react';

export default function MoleculeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let atoms: Atom[] = [];
    let animationFrameId: number;
    let draggedAtom: Atom | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const types = [
      { name: 'C', color: '#64748b', size: 24 },
      { name: 'H', color: '#38bdf8', size: 14 },
      { name: 'O', color: '#f43f5e', size: 20 },
      { name: 'N', color: '#10b981', size: 22 }
    ];

    class Atom {
      type: typeof types[0];
      x: number;
      y: number;
      vx: number;
      vy: number;
      isDragging: boolean = false;

      constructor(cw: number, ch: number) {
        this.type = types[Math.floor(Math.random() * types.length)];
        // Add padding to prevent spawning out of bounds
        const padding = this.type.size;
        this.x = padding + Math.random() * (cw - padding * 2);
        this.y = padding + Math.random() * (ch - padding * 2);
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
      }
      
      update(cw: number, ch: number) {
        if (this.isDragging) {
          this.x = mouseX;
          this.y = mouseY;
          this.vx = 0;
          this.vy = 0;
        } else {
          this.x += this.vx;
          this.y += this.vy;
          
          if (this.x < this.type.size || this.x > cw - this.type.size) {
             this.vx *= -1;
             this.x = Math.max(this.type.size, Math.min(this.x, cw - this.type.size));
          }
          if (this.y < this.type.size || this.y > ch - this.type.size) {
             this.vy *= -1;
             this.y = Math.max(this.type.size, Math.min(this.y, ch - this.type.size));
          }
        }
      }
      
      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.type.size + (this.isDragging ? 4 : 0), 0, Math.PI * 2);
        c.fillStyle = this.type.color;
        c.shadowColor = this.type.color;
        c.shadowBlur = this.isDragging ? 15 : 5;
        c.fill();
        c.shadowBlur = 0; // Reset shadow

        c.strokeStyle = 'rgba(255,255,255,0.15)';
        c.lineWidth = this.isDragging ? 3 : 2;
        c.stroke();

        c.fillStyle = '#111';
        c.font = `bold ${this.type.size - 4}px sans-serif`;
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillText(this.type.name, this.x, this.y);
      }
    }

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 400;
        
        // Re-initialize atoms if they don't exist yet
        if (atoms.length === 0) {
          for (let i = 0; i < 20; i++) {
            atoms.push(new Atom(canvas.width, canvas.height));
          }
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse events for dragging
    const getMousePos = (evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in evt) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
      } else {
        clientX = (evt as MouseEvent).clientX;
        clientY = (evt as MouseEvent).clientY;
      }
      
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      const pos = getMousePos(e);
      mouseX = pos.x;
      mouseY = pos.y;
      
      // Find clicked atom (start from the end to pick the top visible atom)
      for (let i = atoms.length - 1; i >= 0; i--) {
        const atom = atoms[i];
        const dx = mouseX - atom.x;
        const dy = mouseY - atom.y;
        if (Math.sqrt(dx * dx + dy * dy) <= atom.type.size + 10) {
          draggedAtom = atom;
          atom.isDragging = true;
          canvas.style.cursor = 'grabbing';
          break;
        }
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const pos = getMousePos(e);
      
      if (draggedAtom) {
        if (e.cancelable) e.preventDefault(); // Prevent scrolling while dragging on touch devices
        mouseX = pos.x;
        mouseY = pos.y;
      } else {
        // Change cursor on hover
        let isHovering = false;
        for (let i = atoms.length - 1; i >= 0; i--) {
          const atom = atoms[i];
          const dx = pos.x - atom.x;
          const dy = pos.y - atom.y;
          if (Math.sqrt(dx * dx + dy * dy) <= atom.type.size + 10) {
            isHovering = true;
            break;
          }
        }
        canvas.style.cursor = isHovering ? 'grab' : 'default';
      }
    };

    const handleUp = () => {
      if (draggedAtom) {
        draggedAtom.isDragging = false;
        
        // Give the atom a small burst of momentum when released
        draggedAtom.vx = (Math.random() - 0.5) * 2;
        draggedAtom.vy = (Math.random() - 0.5) * 2;
        
        draggedAtom = null;
        canvas.style.cursor = 'grab';
      }
    };
    
    const handleLeave = () => {
      if (draggedAtom) {
        draggedAtom.isDragging = false;
        draggedAtom = null;
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleLeave);
    
    canvas.addEventListener('touchstart', handleDown, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw bonds
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150; // Increased distance for visibility
          
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      atoms.forEach(atom => {
        atom.update(canvas.width, canvas.height);
        atom.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('touchstart', handleDown);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full rounded-2xl border border-white/5 bg-black/40 block" />;
}

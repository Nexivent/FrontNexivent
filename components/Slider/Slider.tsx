'use client';

import { useRef, useState, useEffect } from 'react';

interface IProps {
  touch?: boolean;
  margin?: number;
  children: React.ReactNode;
}

const Slider: React.FC<IProps> = ({ margin = 16, touch = true, children }) => {
  const startX = useRef(0);
  const isDown = useRef(false);
  const itemWidth = useRef(0);
  const scrollLeftX = useRef(0);
  const preventClick = useRef(false);
  const movedDistance = useRef(0);
  const navReferenceDiv = useRef<HTMLDivElement | null>(null);

  const [leftArrowDisabled, setLeftArrowDisabled] = useState(true);
  const [rightArrowDisabled, setRightArrowDisabled] = useState(false);

  useEffect(() => {
    const currentNav = navReferenceDiv.current!;
    if (!currentNav) return;

    const updateButtons = () => {
      const { offsetWidth, scrollWidth, scrollLeft } = currentNav;
      setLeftArrowDisabled(scrollLeft <= 0);
      setRightArrowDisabled(scrollWidth - Math.round(scrollLeft) <= offsetWidth + 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      const x = e.pageX - currentNav.offsetLeft;
      const walk = x - startX.current;
      currentNav.scrollLeft = scrollLeftX.current - walk;
      movedDistance.current = Math.abs(walk);
      preventClick.current = movedDistance.current > 5;
      updateButtons();
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDown.current = true;
      startX.current = e.pageX - currentNav.offsetLeft;
      scrollLeftX.current = currentNav.scrollLeft;
      preventClick.current = false;
      movedDistance.current = 0;
      updateButtons();
    };

    const handleMouseUp = () => { isDown.current = false; };
    const handleMouseLeave = () => { isDown.current = false; preventClick.current = false; };
    const handleScroll = () => { updateButtons(); };
    const handleClick = (e: MouseEvent) => { if (preventClick.current) e.preventDefault(); };

    if (currentNav.children.length > 0) {
      const firstChild = currentNav.children[0] as HTMLElement;
      itemWidth.current = firstChild.offsetWidth + margin;
    }

    updateButtons();

    window.addEventListener('resize', updateButtons);
    currentNav.addEventListener('click', handleClick);
    currentNav.addEventListener('scroll', handleScroll);

    if (touch) {
      currentNav.addEventListener('mouseup', handleMouseUp);
      currentNav.addEventListener('mousedown', handleMouseDown);
      currentNav.addEventListener('mousemove', handleMouseMove);
      currentNav.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('resize', updateButtons);
      currentNav.removeEventListener('click', handleClick);
      currentNav.removeEventListener('scroll', handleScroll);
      if (touch) {
        currentNav.removeEventListener('mouseup', handleMouseUp);
        currentNav.removeEventListener('mousedown', handleMouseDown);
        currentNav.removeEventListener('mousemove', handleMouseMove);
        currentNav.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [touch, margin]);

  const handleHorizontalScroll = (direction: 'left' | 'right') => {
    const scrollAmount = direction === 'left' ? -itemWidth.current : itemWidth.current;
    navReferenceDiv.current!.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    const { offsetWidth, scrollWidth, scrollLeft } = navReferenceDiv.current!;
    setLeftArrowDisabled(scrollLeft <= 0);
    setRightArrowDisabled(scrollWidth - Math.round(scrollLeft) <= offsetWidth + 1);
  };

  return (
    <div className='relative w-full flex items-center'>
      {!leftArrowDisabled && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 z-10'>
          <button
            type='button'
            onClick={() => handleHorizontalScroll('left')}
            className='button-circle'
          >
            <span className='material-symbols-outlined'>chevron_left</span>
          </button>
        </div>
      )}

      <div
        className='flex overflow-x-auto scroll-smooth items-center gap-4 no-scrollbar px-2'
        ref={navReferenceDiv}
      >
        {children}
      </div>

      {!rightArrowDisabled && (
        <div className='absolute right-0 top-1/2 -translate-y-1/2 z-10'>
          <button
            type='button'
            onClick={() => handleHorizontalScroll('right')}
            className='button-circle'
          >
            <span className='material-symbols-outlined'>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Slider;

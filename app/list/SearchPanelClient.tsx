'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchPanel: React.FC = () => {
  const searchParams = useSearchParams();
  const openParam = searchParams?.get('search') ?? '';

  const [keyword, setKeyword] = useState<string>(searchParams?.get('keyword') ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (openParam === '1') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [openParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className='list-search-form'>
      <div
        className='search-inputs flex flex-h-center flex-space-between'
        style={{ width: '100%' }}
      >
        <div
          className='search-input-wrapper'
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            paddingLeft: 16,
            paddingRight: 16,
            boxSizing: 'border-box',
          }}
        >
          <input
            id='list-search-input'
            ref={inputRef}
            type='text'
            name='keyword'
            value={keyword}
            onChange={handleChange}
            maxLength={64}
            placeholder='Eventos, local, artista, palabra clave'
            className='input-text'
            autoComplete='off'
            aria-label='Buscar eventos'
            style={{
              paddingRight: 44,
              boxSizing: 'border-box',
              width: '100%',
              height: 56,
              borderRadius: 8,
            }}
          />
          <button
            type='submit'
            aria-label='Buscar'
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              height: 36,
              width: 36,
              color: 'inherit',
            }}
          >
            <span className='material-symbols-outlined' aria-hidden>
              search
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchPanel;

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================
  // 1. ANIMACIÓN DE ENTRADA (SPLASH SCREEN: 2 SEGUNDOS)
  // ==========================================================
  const splashScreen = document.getElementById('splash-screen');
  const mainContent = document.getElementById('main-content');
  const SPLASH_DURATION = 2000; // 2 segundos

  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      mainContent.classList.add('visible');
    }, 250);
  }, SPLASH_DURATION);

  // ==========================================================
  // 2. REPRODUCTOR DE MÚSICA & SIMULACIÓN DEL TOCADISCOS
  // ==========================================================
  const audio = document.getElementById('audio-player');
  const turntableContainer = document.getElementById('turntable-container');
  const playerStatusText = document.getElementById('player-status-text');
  const songItems = document.querySelectorAll('.song-item');
  const timelineTrack = document.getElementById('timeline-track');
  const timelineProgress = document.getElementById('timeline-progress');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const volumeSlider = document.getElementById('volume-slider');
  const btnVolume = document.getElementById('btn-volume');

  let currentSongIndex = -1;
  let previousVolume = 0.8;

  // Ajuste inicial de volumen
  if (audio) {
    audio.volume = 0.8;
  }

  // Formato de segundos a mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Cargar y reproducir una canción por índice
  function playSong(index) {
    if (index < 0 || index >= songItems.length) return;

    const item = songItems[index];
    const src = item.dataset.src;
    const title = item.dataset.title;

    // Si es una canción distinta, cambiamos la fuente
    if (currentSongIndex !== index) {
      currentSongIndex = index;
      audio.src = src;
      audio.load();

      // Resetear clases activas de todas las canciones
      songItems.forEach(el => {
        el.classList.remove('is-active', 'is-playing');
      });

      item.classList.add('is-active');
    }

    // Reproducir audio
    audio.play()
      .then(() => {
        item.classList.add('is-playing');
        turntableContainer.classList.add('is-playing');
        playerStatusText.textContent = `Sonando: ${title} ♪`;
      })
      .catch((err) => {
        console.warn('Reproducción en espera o bloqueada por política del navegador:', err);
      });
  }

  // Pausar reproducción
  function pauseSong() {
    audio.pause();
    turntableContainer.classList.remove('is-playing');
    if (currentSongIndex !== -1) {
      const currentItem = songItems[currentSongIndex];
      currentItem.classList.remove('is-playing');
      const title = currentItem.dataset.title;
      playerStatusText.textContent = `En pausa: ${title}`;
    } else {
      playerStatusText.textContent = 'Tocadiscos en pausa';
    }
  }

  // Clic en el tocadiscos: reproduce o pausa la canción actual (o la primera si aún no se eligió ninguna)
  if (turntableContainer) {
    turntableContainer.addEventListener('click', () => {
      if (currentSongIndex === -1) {
        playSong(0); // Inicia con la primera canción
      } else if (audio.paused) {
        playSong(currentSongIndex);
      } else {
        pauseSong();
      }
    });
  }

  // Asignar eventos de clic a cada canción de la lista
  songItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (currentSongIndex === index) {
        if (audio.paused) {
          playSong(index);
        } else {
          pauseSong();
        }
      } else {
        playSong(index);
      }
    });
  });

  // Progreso en tiempo real
  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      timelineProgress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  // Duración total cuando cargan los metadatos
  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  // Avanzar a la siguiente canción al terminar
  audio.addEventListener('ended', () => {
    const nextIndex = (currentSongIndex + 1) % songItems.length;
    playSong(nextIndex);
  });

  // Barra de tiempo buscable al hacer clic
  if (timelineTrack) {
    timelineTrack.addEventListener('click', (e) => {
      if (!audio.src || isNaN(audio.duration)) return;
      const rect = timelineTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekTime = (clickX / width) * audio.duration;
      audio.currentTime = seekTime;
    });
  }

  // Control de volumen (Slider)
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      if (val > 0) {
        previousVolume = val;
      }
    });
  }

  // Botón de silenciar/restaurar volumen
  if (btnVolume) {
    btnVolume.addEventListener('click', () => {
      if (audio.volume > 0) {
        previousVolume = audio.volume;
        audio.volume = 0;
        if (volumeSlider) volumeSlider.value = 0;
      } else {
        audio.volume = previousVolume || 0.8;
        if (volumeSlider) volumeSlider.value = audio.volume;
      }
    });
  }

  // ==========================================================
  // 3. CARTITA DEDICATORIA DESPLEGABLE
  // ==========================================================
  const btnEnvelope = document.getElementById('btn-envelope');
  const secretLetter = document.getElementById('secret-letter');

  if (btnEnvelope && secretLetter) {
    btnEnvelope.addEventListener('click', () => {
      const isOpen = secretLetter.classList.toggle('is-open');
      const textSpan = btnEnvelope.querySelector('.envelope-text');
      if (textSpan) {
        textSpan.textContent = isOpen ? 'Cerrar cartita' : 'Abrir cartita para ti';
      }
    });
  }

  // ==========================================================
  // 4. PERSONAJES INTERACTIVOS (BOCADILLOS DE DIÁLOGO)
  // ==========================================================
  const decorItems = document.querySelectorAll('.decor-item');
  decorItems.forEach(item => {
    item.addEventListener('click', () => {
      const alreadyOpen = item.classList.contains('show-bubble');
      decorItems.forEach(d => d.classList.remove('show-bubble'));
      
      if (!alreadyOpen) {
        item.classList.add('show-bubble');
        setTimeout(() => {
          item.classList.remove('show-bubble');
        }, 3500);
      }
    });
  });

  // ==========================================================
  // 5. BOTÓN CELEBRAR (LLUVIA DE CONFETI Y CORAZONES)
  // ==========================================================
  const btnConfetti = document.getElementById('btn-confetti');
  const emojis = ['✨', '🤎', '🤍', '🌸', '🎶', '☕', '⭐'];

  function throwConfetti() {
    for (let i = 0; i < 28; i++) {
      const particle = document.createElement('span');
      particle.className = 'confetti-particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = `${Math.random() * 95}vw`;
      particle.style.top = `${Math.random() * 20 - 10}vh`;
      particle.style.animationDelay = `${Math.random() * 0.8}s`;
      particle.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 4000);
    }
  }

  if (btnConfetti) {
    btnConfetti.addEventListener('click', throwConfetti);
  }

  // ==========================================================
  // 6. ALTERNAR MODO NOCHE CÁLIDO / DÍA
  // ==========================================================
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const isNight = document.body.classList.toggle('theme-night');
      if (themeIcon) themeIcon.textContent = isNight ? '☀️' : '🌙';
      if (themeText) themeText.textContent = isNight ? 'Modo día' : 'Modo noche';
    });
  }

  // ==========================================================
  // 7. ATAJO DE TECLADO: ESPACIO PARA PLAY/PAUSA
  // ==========================================================
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      if (currentSongIndex === -1) {
        playSong(0);
      } else if (audio.paused) {
        playSong(currentSongIndex);
      } else {
        pauseSong();
      }
    }
  });
});

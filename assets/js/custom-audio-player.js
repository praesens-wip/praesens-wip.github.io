// Custom Audio Player
(function() {
  const audioPlayer = {
    audio: new Audio(),
    currentTrackIndex: 0,
    tracks: [],

    init(tracks) {
      this.tracks = tracks;
      this.audio.src = tracks[this.currentTrackIndex];
      this.audio.addEventListener('ended', () => this.nextTrack());
      this.renderPlayer();
    },

    play() {
      this.audio.play();
      document.querySelector('#play-button').textContent = 'Pause';
    },

    pause() {
      this.audio.pause();
      document.querySelector('#play-button').textContent = 'Play';
    },

    togglePlay() {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    },

    nextTrack() {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      this.audio.src = this.tracks[this.currentTrackIndex];
      this.play();
    },

    renderPlayer() {
      const playerContainer = document.createElement('div');
      playerContainer.id = 'audio-player';
      playerContainer.innerHTML = `
        <button id="play-button">Play</button>
        <button id="next-button">Next</button>
      `;
      document.body.appendChild(playerContainer);

      document.querySelector('#play-button').addEventListener('click', () => this.togglePlay());
      document.querySelector('#next-button').addEventListener('click', () => this.nextTrack());
    }
  };

  // Initialize the player with tracks from the page metadata
  document.addEventListener('DOMContentLoaded', () => {
    const trackElements = document.querySelectorAll('.album-tracklist .tracks li');
    const tracks = Array.from(trackElements).map(el => el.textContent.trim());
    audioPlayer.init(tracks);
  });
})();
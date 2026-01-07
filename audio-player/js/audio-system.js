function initAudioPlayers() {
	const players = document.querySelectorAll('.album-audio-player');
	players.forEach(function (el) {
		const type = el.getAttribute('data-type');
		const url = el.getAttribute('data-url');
		if (type === 'bandcamp') {
			// Bandcamp Album-URL zu Embed-ID extrahieren
			const match = url.match(/bandcamp\.com\/album\/([a-zA-Z0-9-_]+)/);
			const albumId = match ? match[1] : '';
			// Bandcamp Embed
			el.innerHTML = `<iframe style="border: 0; width: 100%; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=ffffff/linkcol=0687f5/transparent=true/" seamless></iframe>`;
		} else if (type === 'soundcloud') {
			// SoundCloud Embed
			el.innerHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230687f5"></iframe>`;
		}
	});
}

if (typeof window !== 'undefined') {
	// Handle both cases: DOMContentLoaded already fired or not yet fired
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAudioPlayers);
	} else {
		// DOM is already loaded, run immediately
		initAudioPlayers();
	}
}

if (typeof module !== 'undefined') {
	module.exports = { initAudioPlayers };
}

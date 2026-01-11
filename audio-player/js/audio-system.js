function renderBandcampEmbed(el) {
	// Numeric album ID from stream loader is REQUIRED for proper display
	// Using slug-based URLs will cause "not available" errors
	let albumId = el.getAttribute('data-album-id');
	
	if (albumId) {
		// Bandcamp Embed - MUST use numeric ID
		el.innerHTML = `<iframe style="border: 0; width: 100%; height: 42px;" src="https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/" seamless></iframe>`;
	}
	// If no numeric album ID available, don't render (wait for stream loader)
}

function initAudioPlayers() {
	const players = document.querySelectorAll('.album-audio-player');
	players.forEach(function (el) {
		const type = el.getAttribute('data-type');
		const url = el.getAttribute('data-url');
		if (type === 'bandcamp') {
			// Render immediately if numeric album ID is already set
			if (el.getAttribute('data-album-id')) {
				renderBandcampEmbed(el);
			} else {
				// Wait for stream loader to set numeric album ID
				// This is REQUIRED for Bandcamp iframe to work
				const checkInterval = setInterval(function() {
					if (el.getAttribute('data-album-id')) {
						clearInterval(checkInterval);
						renderBandcampEmbed(el);
					}
				}, 50);
				
				// Stop checking after 3 seconds
				setTimeout(function() {
					clearInterval(checkInterval);
				}, 3000);
			}
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

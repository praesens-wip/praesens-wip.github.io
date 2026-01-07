// Audio Player Integration Test
// Läuft im Browser mit z.B. Cypress oder Playwright
// Testet, ob der Player geladen wird und Tracks abspielbar sind

describe('Audio Player', () => {
  it('should load the player', () => {
    cy.visit('/');
    cy.get('#global-player').should('exist');
  });

  it('should list tracks from tracks.json', () => {
    cy.readFile('data/tracks.json').then(tracks => {
      expect(tracks.length).to.be.greaterThan(0);
      cy.get('[data-track-url]').should('have.length', tracks.length);
    });
  });

  it('should play a SoundCloud track', () => {
    cy.get('[data-track-url="https://soundcloud.com/sokkohai/kudamm-98"]').click();
    cy.get('#statusIndicator').should('contain', 'On Air');
  });

  it('should play a Bandcamp track', () => {
    cy.get('[data-track-url="https://slowerpace.bandcamp.com/track/elevator-ride-interlude"]').click();
    cy.get('#statusIndicator').should('contain', 'On Air');
  });

  it('should play an own track', () => {
    cy.get('[data-track-url="/public/downloads/Bucket Listener Watches The Stars.mp3"]').click();
    cy.get('#statusIndicator').should('contain', 'On Air');
  });
});

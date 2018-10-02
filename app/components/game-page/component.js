import Ember from 'ember';
import { GAME_STATUS, DEFAULT_RESTART_BTN_LABEL } from 'minesweeper-game/lib/constants';

export default Ember.Component.extend({
  classNames: ['game-page'],
  gameService: Ember.inject.service(),
  gameStatus: Ember.computed.oneWay('gameService.gameStatus'),
  gridCells: Ember.computed.oneWay('gameService.gridCells'),
  elapsedTime: Ember.computed.oneWay('gameService.elapsedTime'),
  minesCount: Ember.computed.oneWay('gameService.minesCount'),
  restartButtonLabel: DEFAULT_RESTART_BTN_LABEL,

  restartButtonClass: Ember.computed('gameService.gameStatus', function () {
    const gameStatus = this.get('gameStatus');

    switch (gameStatus) {
      case GAME_STATUS.NOT_STARTED:
      case GAME_STATUS.IN_PROGRESS:
        return 'bg-happy_face';
      case GAME_STATUS.LOST:
      case GAME_STATUS.OUT_OF_TIME:
        return 'bg-sad_face';
      case GAME_STATUS.WIN:
        return 'bg-cool_face';
      default: 
        return '';
    }
  }),

  gameStatusObserver: Ember.observer('gameStatus', function () {
    const gameStatus = this.get('gameStatus');

    if (gameStatus === GAME_STATUS.WIN ||
        gameStatus === GAME_STATUS.LOST || 
        gameStatus === GAME_STATUS.OUT_OF_TIME) {
      this.updateRestartButtonLabel(gameStatus === GAME_STATUS.WIN ?
        'Congratulations! You have win this game' :
        'Sorry! But you lose the game');
      // Move focus to restart button so that screen reader users can immediately restart
      const restartButton = this.$('.game-page__reset-btn');
      restartButton.focus();
    }
  }),

  didInsertElement(...args) {
    this._super(args);

    Ember.run.scheduleOnce('afterRender', this, this.setupGlobalKeyHandler);
  },

  restartGame() {
    this.set('restartButtonLabel', DEFAULT_RESTART_BTN_LABEL);
    const gameService = this.get('gameService');

    gameService.reset();
  },

  onGridCellClicked(payload) {
    const gameService = this.get('gameService');

    gameService.updateCellState(payload);
  },

  setupGlobalKeyHandler() {
    const globalKeyHandler = (event) => {
      // alt + s will restart the game
      if (event.keyCode === 83 && event.altKey) {
        this.restartGame();
      }
    }
    this.set('_globalKeyHandler', globalKeyHandler);

    Ember.$(document).on('keydown', this.get('_globalKeyHandler'));
  },

  willDestroyElement(...args) {
    this._super(args);

    const globalKeyHandler = this.get('_globalKeyHandler');

    Ember.$(document).off('keydown', globalKeyHandler);
  },

  updateRestartButtonLabel(text) {
    this.set('restartButtonLabel', `${text}, Click to restart the game`);
  },

  actions: {
    gridCellClicked(payload) {
      this.onGridCellClicked(payload)
    },

    restartGame() {
      this.restartGame();
    }
  }
});

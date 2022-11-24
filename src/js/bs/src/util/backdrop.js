/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.1.3): util/backdrop.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler';
import { execute, executeAfterTransition, getElement, reflow, typeCheckConfig } from './index';

const Default = {
  className: 'modal-backdrop',
  isVisible: true, // if false, we use the backdrop helper without adding any element to the dom
  isAnimated: false,
  rootElement: 'body', // give the choice to place backdrop under different elements
  clickCallback: null,
};

const DefaultType = {
  className: 'string',
  isVisible: 'boolean',
  isAnimated: 'boolean',
  rootElement: '(element|string)',
  clickCallback: '(function|null)',
};
const NAME = 'backdrop';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const ANIMATION_FADE_IN = [{ opacity: '0' }, { opacity: '50%' }];
const ANIMATION_FADE_OUT = [{ opacity: '50%' }, { opacity: '0' }];

const ANIMATION_TIMING = {
  duration: 300,
  iterations: 1,
  easing: 'ease',
  fill: 'both',
};

const EVENT_MOUSEDOWN = `mousedown.te.${NAME}`;

class Backdrop {
  constructor(config) {
    this._config = this._getConfig(config);
    this._isAppended = false;
    this._element = null;
  }

  show(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }

    this._append();

    if (this._config.isAnimated) {
      reflow(this._getElement());
    }

    this._getElement().classList.add(CLASS_NAME_SHOW);
    this._element.setAttribute(`data-te-backdrop-${CLASS_NAME_SHOW}`, '');
    this._config.isAnimated && this._element.animate(ANIMATION_FADE_IN, ANIMATION_TIMING);

    this._emulateAnimation(() => {
      execute(callback);
    });
  }

  hide(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }
    this._config.isAnimated && this._element.animate(ANIMATION_FADE_OUT, ANIMATION_TIMING);

    setTimeout(
      () => {
        this._getElement().classList.remove(CLASS_NAME_SHOW);
        this._element.removeAttribute(`data-te-backdrop-${CLASS_NAME_SHOW}`);

        this._emulateAnimation(() => {
          this.dispose();
          execute(callback);
        });
      },
      this._config.isAnimated ? ANIMATION_TIMING.duration : 0
    );
  }

  // Private

  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement('div');
      backdrop.className = this._config.className;
      if (this._config.isAnimated) {
        backdrop.classList.add(CLASS_NAME_FADE);
      }

      this._element = backdrop;
    }

    return this._element;
  }

  _getConfig(config) {
    config = {
      ...Default,
      ...(typeof config === 'object' ? config : {}),
    };

    // use getElement() with the default "body" to get a fresh Element on each instantiation
    config.rootElement = getElement(config.rootElement);
    typeCheckConfig(NAME, config, DefaultType);
    return config;
  }

  _append() {
    if (this._isAppended) {
      return;
    }

    this._config.rootElement.append(this._getElement());

    EventHandler.on(this._getElement(), EVENT_MOUSEDOWN, () => {
      execute(this._config.clickCallback);
    });

    this._isAppended = true;
  }

  dispose() {
    if (!this._isAppended) {
      return;
    }

    EventHandler.off(this._element, EVENT_MOUSEDOWN);

    this._element.remove();
    this._isAppended = false;
  }

  _emulateAnimation(callback) {
    executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
  }
}

export default Backdrop;

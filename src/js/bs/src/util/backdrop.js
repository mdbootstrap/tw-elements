/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.1.3): util/backdrop.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from "../dom/event-handler";
import Manipulator from "../../../mdb/dom/manipulator";
import {
  execute,
  executeAfterTransition,
  getElement,
  reflow,
  typeCheckConfig,
} from "./index";

const Default = {
  isVisible: true, // if false, we use the backdrop helper without adding any element to the dom
  isAnimated: false,
  rootElement: "body", // give the choice to place backdrop under different elements
  clickCallback: null,
  customClasses: null,
};

const DefaultType = {
  isVisible: "boolean",
  isAnimated: "boolean",
  rootElement: "(element|string)",
  clickCallback: "(function|null)",
  customClasses: "(array|null)",
};
const NAME = "backdrop";
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

    const backdropClasses = this._config.backdropClasses || [
      "opacity-50",
      "transition-all",
      "duration-300",
      "ease-in-out",
      "fixed",
      "top-0",
      "left-0",
      "z-50",
      "bg-black",
      "w-screen",
      "h-screen",
    ];

    Manipulator.removeClass(this._getElement(), "opacity-0");
    Manipulator.addMultipleClasses(this._getElement(), backdropClasses);
    this._element.setAttribute("data-te-backdrop-show", "");

    this._emulateAnimation(() => {
      execute(callback);
    });
  }

  hide(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }

    this._element.removeAttribute("data-te-backdrop-show");
    this._getElement().classList.add("opacity-0");
    this._getElement().classList.remove("opacity-50");

    this._emulateAnimation(() => {
      this.dispose();
      execute(callback);
    });
  }

  // Private

  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement("div");
      backdrop.className = this._config.className;
      if (this._config.isAnimated) {
        backdrop.classList.add("opacity-50");
      }

      this._element = backdrop;
    }

    return this._element;
  }

  _getConfig(config) {
    config = {
      ...Default,
      ...(typeof config === "object" ? config : {}),
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
    executeAfterTransition(
      callback,
      this._getElement(),
      this._config.isAnimated
    );
  }
}

export default Backdrop;

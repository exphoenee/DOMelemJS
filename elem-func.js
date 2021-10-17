function createElem({ tag, content, text, attrs, parent, handleEvent }) {
  /*
   * create the DOM element with the given tag
   */
  let elem = document.createElement(tag);

  /*
   *  add all the attributes they want
   */
  for (let attr in attrs) {
    if (attr === "dataset") {
      for (let data in attrs[attr]) {
        elem.dataset[data] = attrs[attr][data];
      }
    } else if (attr === "style") {
      if (typeof attrs[attr] === "string") {
        attrs[attr].split(";").forEach((style) => {
          const styleComponent = style.split(":");
          console.table(styleComponent);
        });
      } else {
      }
    } else {
      if (Array.isArray(attrs[attr])) {
        elem.setAttribute(attr, attrs[attr].join(" "));
      } else {
        elem.setAttribute(attr, attrs[attr]);
      }
    }
  }

  /*
   * Add the eventListener or more eventListeners it hey comes in array
   */
  let eventsToAdd = [];
  /*
   * Handle event is an object or an array of object, that schould be conain:
   * event, what will fire the event?
   * and a cb, that is the callback function
   */
  if (handleEvent) {
    if (Array.isArray(handleEvent)) {
      eventsToAdd = [...handleEvent];
    } else {
      eventsToAdd.push(handleEvent);
    }
    eventsToAdd.forEach((newEvent) => {
      elem.addEventListener(newEvent.event, newEvent.cb);
    });
  }

  /*
   * add the content
   */
  content && (elem.innerHTML = content);
  /*
   * add the text
   */
  text && (elem.textContent = text);

  /*
  * Append the created elem to the parent what is given, or add to the body of the Document if not given.

  * The parent:
    * can be a DOM element, or
    * a String of:
        * ID or
        * CLass
  */
  if (parent) {
    if (typeof parent === "string") {
      parent = [".", "#"]
        .map((prep) => {
          return document.querySelector(prep + parent);
        })
        .filter((pe) => {
          return pe !== null;
        })[0];
    }
  } else parent = document.querySelector("body");

  parent.appendChild(elem);

  /*
   * and at the end give the elem back for later usage
   */
  return elem;
}

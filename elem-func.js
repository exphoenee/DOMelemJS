function createElem({ tag, content, attrs, parent, handleEvent }) {
  let elem = document.createElement(tag);
  for (let a in attrs) {
    if (a === "dataset") {
      for (let data in attrs[a]) {
        elem.dataset[data] = attrs[a][data];
      }
    } else {
      if (Array.isArray(attrs[a])) {
        elem.setAttribute(a, attrs[a].join(" "));
      } else {
        elem.setAttribute(a, attrs[a]);
      }
    }
  }

  let eventsToAdd = [];

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

  elem.innerHTML = content ? content : null;

  if (typeof parent === "string") {
    parent = [".", "#"]
      .map((prep) => {
        return document.querySelector(prep + parent);
      })
      .filter((pe) => {
        return pe !== null;
      })[0];
  }
  parent.appendChild(elem);
  return elem;
}

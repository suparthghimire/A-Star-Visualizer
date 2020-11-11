const gridContainer = document.querySelector(".grid-container");
const dim = 16;
let totalVisited = 0;
let pathLength = 0;
let allNodes = [];
let startNode = null;
let endNode = null;

// let exploringNodes = [];
// let visitedNodes = [];
let finalPath = [];

class Node {
  constructor(name, gn, hn, parent, isEnd, isStart, isObstacle, neighbours) {
    this.name = name;
    this.gn = gn;
    this.hn = hn;
    this.fn = null;
    this.parent = parent;
    this.end = isEnd;
    this.start = isStart;
    this.obstacle = isObstacle;
    this.neighbours = neighbours;
  }
}

drawGrid();

function drawGrid() {
  allNodes = [];
  finalPath = [];
  totalVisited = 0;
  pathLength = 0;

  document.querySelector("#path-length").innerText = pathLength;
  document.querySelector("#visited-nodes").innerText = totalVisited;

  document.querySelector("#reset_board").disabled = false;
  document.querySelector("#start_algo").disabled = false;
  //
  document.querySelector(".grid-container").innerHTML = "";
  let count = 0;
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      const span = document.createElement("button");
      span.classList.add("grid");
      span.id = count;
      gridContainer.appendChild(span);
      allNodes.push(new Node(count, 0, 0, null, false, false, false, null));
      count++;
    }
  }
  setStartAndEndNode();
}

function traverse(node) {
  node = node.toString();
  document.getElementById(`${node}`).classList.add("traverse");
}
function setStartAndEndNode() {
  let start = Math.floor(Math.random() * 255);
  let end = Math.floor(Math.random() * 255);

  document.getElementById(start).classList.add("start");
  startNode = allNodes.find((node) => node.name === start);
  startNode.start = true;

  document.getElementById(end).classList.add("end");
  endNode = allNodes.find((node) => node.name === end);
  endNode.end = true;
}

gridContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("grid")) {
    if (
      !e.target.classList.contains("start") &&
      !e.target.classList.contains("end")
    ) {
      e.target.classList.toggle("obstacle");
      let obstacleNode = allNodes.find((node) => node.name == e.target.id);
      obstacleNode.obstacle = !obstacleNode.obstacle;
    }
  }
});

gridContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("grid")) {
    if (e.target.classList.contains("start")) {
      setNewStartLocation(e.target);
    } else if (e.target.classList.contains("end")) {
      setNewEndLocation(e.target);
    }
  }
});

function setNewStartLocation(oldStart) {
  gridContainer.addEventListener(
    "click",
    (e) => {
      if (!e.target.classList.contains("obstacle")) {
        if (
          e.target.classList.contains("grid") &&
          !e.target.classList.contains("end")
        ) {
          oldStart.classList.remove("start");
          e.target.classList.add("start");
          let oldStartNode = allNodes.find((node) => node.name == oldStart.id);
          oldStartNode.start = false;
          startNode = allNodes.find((node) => node.name == e.target.id);

          startNode.start = true;
          document.getElementById(startNode.name).classList.add("start");
        }
      }
    },
    { once: true }
  );
}
function setNewEndLocation(oldEnd) {
  gridContainer.addEventListener(
    "click",
    (e) => {
      if (!e.target.classList.contains("obstacle")) {
        if (
          e.target.classList.contains("grid") &&
          !e.target.classList.contains("start")
        ) {
          oldEnd.classList.remove("end");
          e.target.classList.add("end");
          let oldEndNode = allNodes.find((node) => node.name == oldEnd.id);
          oldEndNode.end = false;

          endNode = allNodes.find((node) => node.name == e.target.id);
          endNode.end = true;
          document.getElementById(endNode.name).classList.add("end");
        }
      }
    },
    { once: true }
  );
}

function traversePath(node, key) {
  if (node[key] == null) {
    return;
  } else {
    traversePath(node[key], key);
    let keyName = node[key].name.toString();
    finalPath.push(keyName);
  }
}
function fillPath(data) {
  document.getElementById(startNode.name).classList.add("path");
  document.getElementById(endNode.name).classList.add("path");
  setTimeout(() => {
    document.getElementById(finalPath[data]).classList.add("path");
    pathLength++;
    document.querySelector("#path-length").innerText = pathLength;
  }, 200 * data);

  setTimeout(() => {
    document.querySelector("#reset_board").disabled = false;
    document.querySelector("#start_algo").disabled = false;
  }, 3200);
}

function drawPath(exploringNodes) {
  document.querySelector("#reset_board").disabled = false;
  document.querySelector("#start_algo").disabled = false;

  let finalNode = exploringNodes.find((node) => node.name == endNode.name);

  traversePath(finalNode, "parent");

  for (let i = 0; i < finalPath.length; i++) fillPath(i);

  console.log(allNodes);
}

document.querySelector("#reset_board").addEventListener("click", drawGrid);
document.querySelector(".overlay").style.visibility = "hidden";

document.querySelector(".help").addEventListener("click", () => {
  document.querySelector(".overlay").style.visibility = "visible";
});

document.querySelector("#overlay-close").addEventListener("click", () => {
  document.querySelector(".overlay").style.visibility = "hidden";
});
// A Star Codes
function A_Star() {
  let exploringNodes = [];
  let visitedNodes = [];

  let startNodePtr = startNode;

  startNode.gn = calcGCost(startNode.name);
  startNode.hn = calcHCost(startNode.name);
  startNode.fn = calcFCost(startNode);

  exploringNodes.push(startNodePtr);
  let animate = setInterval(() => {
    document.querySelector("#reset_board").disabled = true;
    document.querySelector("#start_algo").disabled = true;

    if (startNodePtr.end == true) {
      clearInterval(animate);
      drawPath(exploringNodes);
    } else {
      let top = allNodes.find(
        (node) => node.name == findNeighbours(startNodePtr).top
      );
      let right = allNodes.find(
        (node) => node.name == findNeighbours(startNodePtr).right
      );
      let bottom = allNodes.find(
        (node) => node.name == findNeighbours(startNodePtr).bottom
      );
      let left = allNodes.find(
        (node) => node.name == findNeighbours(startNodePtr).left
      );

      startNodePtr.neighbours = [top, right, bottom, left];
      setParent(top, right, bottom, left, startNodePtr, visitedNodes);
      setGCost(top, right, bottom, left);
      setHCost(top, right, bottom, left);
      setFnCost(top, right, bottom, left);

      updateExploringList(
        top,
        right,
        left,
        bottom,
        exploringNodes,
        visitedNodes
      );

      const status = visitedNodes.filter(
        (node) => node.name == startNodePtr.name
      ).length;
      if (status == 0) visitedNodes.push(startNodePtr);

      exploringNodes.shift();
      exploringNodes.sort((a, b) => a.fn - b.fn);

      for (let j = exploringNodes.length - 1; j--; ) {
        if (exploringNodes[j].obstacle == true) {
          exploringNodes.splice(j, 1);
        }
      }

      traverse(startNodePtr.name);

      startNodePtr = exploringNodes[0];
      document.querySelector("#visited-nodes").innerText = totalVisited;
      totalVisited++;
    }
  }, 50);
}
function checkVisited(node, visitedNodes) {
  return visitedNodes.includes(node) ? true : false;
}

function setParent(top, right, bottom, left, parent, visitedNodes) {
  if (top != null && !checkVisited(top, visitedNodes)) {
    top.parent = parent;
  }
  if (right != null && !checkVisited(right, visitedNodes)) {
    right.parent = parent;
  }
  if (bottom != null && !checkVisited(bottom, visitedNodes)) {
    bottom.parent = parent;
  }
  if (left != null && !checkVisited(left, visitedNodes)) {
    left.parent = parent;
  }
}

function updateExploringList(
  top,
  right,
  left,
  bottom,
  exploringNodes,
  visitedNodes
) {
  if (top != null && !checkVisited(top, visitedNodes)) {
    //
    // top.parent = parent;
    const status = exploringNodes.filter((node) => node.name === top.name)
      .length;
    if (status == 0) {
      exploringNodes.push(top);
    }
  }
  if (right != null && !checkVisited(right, visitedNodes)) {
    //
    // right.parent = parent;
    const status = exploringNodes.filter((node) => node.name === right.name)
      .length;
    if (status == 0) {
      exploringNodes.push(right);
    }
  }
  if (bottom != null && !checkVisited(bottom, visitedNodes)) {
    //
    // bottom.parent = parent;
    const status = exploringNodes.filter((node) => node.name === bottom.name)
      .length;
    if (status == 0) {
      exploringNodes.push(bottom);
    }
  }
  if (left != null && !checkVisited(left, visitedNodes)) {
    //
    // left.parent = parent;
    const status = exploringNodes.filter((node) => node.name === left.name)
      .length;
    if (status == 0) {
      exploringNodes.push(left);
    }
  }
}

function setFnCost(top, right, bottom, left) {
  if (top != undefined) {
    top.fn = calcFCost(top);
  }
  if (right != undefined) {
    right.fn = calcFCost(right);
  }
  if (bottom != undefined) {
    bottom.fn = calcFCost(bottom);
  }
  if (left != undefined) {
    left.fn = calcFCost(left);
  }
}
function setGCost(top, right, bottom, left) {
  if (top != undefined) {
    top.gn = calcGCost(top);
    // top.gn = currentGCost;
  }
  if (right != undefined) {
    right.gn = calcGCost(right);
    // right.gn = currentGCost;
  }
  if (bottom != undefined) {
    bottom.gn = calcGCost(bottom);
    // bottom.gn = currentGCost;
  }
  if (left != undefined) {
    left.gn = calcGCost(left);
    // left.gn = currentGCost;
  }
}
function setHCost(top, right, bottom, left) {
  if (top != undefined) {
    top.hn = calcHCost(top.name);
  }
  if (right != undefined) {
    right.hn = calcHCost(right.name);
  }
  if (bottom != undefined) {
    bottom.hn = calcHCost(bottom.name);
  }
  if (left != undefined) {
    left.hn = calcHCost(left.name);
  }
}
function isObstacle(node) {
  return document.getElementById(node.name).classList.contains("obstacle")
    ? true
    : false;
}

function findNeighbours(node) {
  //
  let left, right, top, bottom;
  if (parseInt(node.name) == 0) {
    top = null;
    right = parseInt(node.name) + 1;
    left = null;
    bottom = parseInt(node.name) + 16;
  } else if (parseInt(node.name) == 15) {
    top = null;
    right = null;
    left = parseInt(node.name) - 1;
    bottom = parseInt(node.name) + 16;
  } else if (parseInt(node.name) == 240) {
    top = parseInt(node.name) - 16;
    right = parseInt(node.name) + 1;
    left = null;
    bottom = null;
  } else if (parseInt(node.name) == 255) {
    top = parseInt(node.name) - 16;
    right = null;
    left = parseInt(node.name) - 1;
    bottom = null;
  } else if (createBoundry().top.includes(parseInt(node.name))) {
    top = null;
    right = parseInt(node.name) + 1;
    left = parseInt(node.name) - 1;
    bottom = parseInt(node.name) + 16;
  } else if (createBoundry().bottom.includes(parseInt(node.name))) {
    top = parseInt(node.name) - 16;
    right = parseInt(node.name) + 1;
    left = parseInt(node.name) - 1;
    bottom = null;
  } else if (createBoundry().left.includes(parseInt(node.name))) {
    top = parseInt(node.name) - 16;
    right = parseInt(node.name) + 1;
    left = null;
    bottom = parseInt(node.name) + 16;
  } else if (createBoundry().right.includes(parseInt(node.name))) {
    top = parseInt(node.name) - 16;
    right = null;
    left = parseInt(node.name) - 1;
    bottom = parseInt(node.name) + 16;
  } else {
    right = parseInt(node.name) + 1;
    top = parseInt(node.name) - 16;
    left = parseInt(node.name) - 1;
    bottom = parseInt(node.name) + 16;
  }

  return {
    top,
    bottom,
    left,
    right,
  };
}
function createBoundry() {
  let left = [];
  let right = [];
  let top = [];
  let bottom = [];
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (i == 0) {
        top.push(j);
      }
      if (i == 15) {
        bottom.push(i * 16 + j);
      }
      if (j == 0) {
        left.push(i * 16);
      }
      if (j == 15) {
        right.push(i * 16 + j);
      }
    }
  }
  return {
    top,
    left,
    right,
    bottom,
  };
}
function calcHCost(node) {
  const x1 = mod(parseInt(node), 16);
  const y1 = Math.floor(parseInt(node) / 16);
  const x2 = mod(parseInt(endNode.name), 16);
  const y2 = Math.floor(parseInt(endNode.name) / 16);
  const xdis = (x2 - x1) * (x2 - x1);
  const ydis = (y2 - y1) * (y2 - y1);

  return Math.sqrt(xdis + ydis);
}

function calcGCost(currentNode) {
  if (currentNode.parent == null) return 0;
  return currentNode.parent.gn + 1;
}

function calcFCost(currentNode) {
  return currentNode.gn + currentNode.hn;
}

document.querySelector("#start_algo").addEventListener("click", () => {
  let status = false;
  document.querySelectorAll(".grid").forEach((grid) => {
    if (
      grid.classList.contains("traverse") ||
      grid.classList.contains("path")
    ) {
      status = true;
    }
  });
  console.log(status);
  if (status) {
    drawGrid();
  } else {
    A_Star();
  }
});

function mod(n, m) {
  return ((n % m) + m) % m;
}
import "./style.css";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const infoDiv = document.getElementById("info");
const modal = document.getElementById("aboutModal");
const span = document.getElementsByClassName("close")[0];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

let points = [];
let draggedPoint = null;

function drawPoint(x, y, label, color = "black") {
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.fillText(label, x + 5, y - 5);
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.2;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawIntersectionArea(intersections, color) {
  if (intersections.length === 2) {
    ctx.beginPath();
    ctx.moveTo(intersections[0].x, intersections[0].y);
    ctx.arc(intersections[0].x, intersections[0].y, 2.5, 0, Math.PI * 2);
    ctx.moveTo(intersections[1].x, intersections[1].y);
    ctx.arc(intersections[1].x, intersections[1].y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function calculateDistance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function handleCanvasClick(event) {
  if (points.length < 4) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    points.push({ x, y });

    drawPoint(x, y, String.fromCharCode(65 + points.length - 1));

    if (points.length === 4) {
      drawCirclesAndIntersections();
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
  }
}

function drawCirclesAndIntersections() {
  if (points.length === 4) {
    const [A, B, C, D] = points;
    const radiusAB = calculateDistance(A, B);
    const radiusCD = calculateDistance(C, D);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCircle(A.x, A.y, radiusAB, "blue");
    drawCircle(C.x, C.y, radiusCD, "yellow");

    points.forEach((point, index) =>
      drawPoint(point.x, point.y, String.fromCharCode(65 + index))
    );

    const intersections = findCircleIntersections(
      A.x,
      A.y,
      radiusAB,
      C.x,
      C.y,
      radiusCD
    );

    drawIntersectionArea(intersections, "green");

    let info = "Points:\n";
    points.forEach((p, index) => {
      info += `Point ${String.fromCharCode(65 + index)}: (${p.x.toFixed(
        2
      )}, ${p.y.toFixed(2)})\n`;
    });
    
    if (intersections.length > 0) {
      info += "Intersections:\n";
      intersections.forEach((p, index) => {
        info += `Intersection ${index + 1}: (${p.x.toFixed(2)}, ${p.y.toFixed(
          2
        )})\n`;
      });
    }
    

    infoDiv.textContent = info;

    // Draw intersection points
    intersections.forEach((p, i) => drawPoint(p.x, p.y, "i", "red"));
  }
}

// Function to find intersections of two circles
function findCircleIntersections(x0, y0, r0, x1, y1, r1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > r0 + r1 || d < Math.abs(r0 - r1)) {
    // No solution
    return [];
  }

  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(r0 * r0 - a * a);
  const x2 = x0 + (dx * a) / d;
  const y2 = y0 + (dy * a) / d;
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  return [
    { x: x2 + rx, y: y2 + ry },
    { x: x2 - rx, y: y2 - ry },
  ];
}

function resetCanvas() {
  points = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  infoDiv.textContent = "";
  canvas.addEventListener("click", handleCanvasClick);
  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
}

function showAbout() {
  modal.style.display = "block";
}

document.getElementById("resetButton").addEventListener("click", resetCanvas);
document.getElementById("aboutButton").addEventListener("click", showAbout);

span.onclick = function () {
  modal.style.display = "none";
};

modal.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

canvas.addEventListener("click", handleCanvasClick);

function handleMouseDown(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  draggedPoint = points.find(
    (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
  );
  if (draggedPoint) {
    canvas.style.cursor = "grabbing";
  }
}

function handleMouseMove(event) {
  if (draggedPoint) {
    const rect = canvas.getBoundingClientRect();
    draggedPoint.x = event.clientX - rect.left;
    draggedPoint.y = event.clientY - rect.top;
    drawCirclesAndIntersections();
  } else {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hoverPoint = points.find(
      (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
    );
    if (hoverPoint) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
  }
}

function handleMouseUp() {
  draggedPoint = null;
  canvas.style.cursor = "default";
}

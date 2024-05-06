
document.addEventListener("DOMContentLoaded", function(){

  const canvas = document.getElementById('issue1-canvas');
  const context = canvas.getContext('2d');


  /// various helper functions

  function getRandomNumber(min, max) {
    // return random number
      return Math.random() * (max - min) + min;
  }


  function box(start_x, start_y,up=true) {
    // create a box, either up or down
    let point_0_x = start_x;
    let point_0_y;
    if (up==true){
      point_0_y = start_y + getRandomNumber(-4, 30);
    }else{
      point_0_y = start_y + getRandomNumber(-30, -4);
    }
    let point_1_x = point_0_x + 20;//;getRandomNumber(50, 30);
    let point_1_y = point_0_y;

    let point_2_x = point_1_x;
    let point_2_y = start_y;

    return [[point_0_x, point_0_y],[point_1_x, point_1_y],[point_2_x, point_2_y]];
  }


  function randomPointBetweenCentroidAndMidpoint(vertices) {
    // Check if the input has four vertices
    if (vertices.length !== 4) {
      throw new Error("Invalid input: Quadrilateral should have 4 vertices.");
    }

    // Calculate the centroid
    let sumX = 0;
    let sumY = 0;

    for (const vertex of vertices) {
      sumX += vertex[0];
      sumY += vertex[1];
    }

    const centroidX = sumX / 4;
    const centroidY = sumY / 4;

    // Get the x-coordinates of points 2 and 3
    const x2 = vertices[1][0];
    const x3 = vertices[2][0];

    // Calculate the midpoint of the horizontal line created by points 2 and 3
    const midpointX = (x2 + x3) / 2;
    const midpointY = (vertices[1][1] + vertices[2][1]) / 2;

    // Generate a random value between centroidY and midpointY (inclusive)
    const randomY = Math.random() * (midpointY - centroidY) + centroidY;

    // Return the point with the same x-value and the random y-value
    return [centroidX, randomY];
  }


  function calculateDistance(x1, y1, x2, y2) {
    // calc distance between two points
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    // Use the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance;
  }


  function getRandomSubsequences(arr, n, k) {
    if (k <= 0 || k > arr.length) {
      return "Invalid input: k is out of range";
    }
    
    if (n <= 0) {
      return "Invalid input: n must be greater than 0";
    }

    // Create an array to store the subsequences
    const subsequences = [];

    for (let i = 0; i < n; i++) {
      // Create a copy of the original array for each subsequence
      const copy = [...arr];
      const subsequence = [];

      // Randomly select k elements from the copy and add them to the subsequence
      for (let j = 0; j < k; j++) {
        const randomIndex = Math.floor(Math.random() * copy.length);
        subsequence.push(copy.splice(randomIndex, 1)[0]);
      }
      subsequences.push(subsequence);
    }
    return subsequences;
  }


  function getPointsRandomLineTo(startX,startY,pointX, pointY, length, maxDeviationDegrees=70) {
    // plots a line of a particular length from point to point but with some deviation

    // Calculate the direction vector
    const deltaX = pointX - startX;
    const deltaY = pointY - startY;

    // Calculate the length of the vector
    const vectorLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate the angle of the direction vector
    const angle = Math.atan2(deltaY, deltaX);

    // Add randomness to the angle
    const deviationRadians = (Math.random() - 0.5) * (maxDeviationDegrees * (Math.PI / 180));
    const newAngle = angle + deviationRadians;

    // Calculate the new direction vector
    const newDeltaX = Math.cos(newAngle) * vectorLength;
    const newDeltaY = Math.sin(newAngle) * vectorLength;

    // Calculate the scaling factor to achieve the desired length
    const scaleFactor = length / vectorLength;

    // Calculate the endpoint
    const endX = startX + scaleFactor * newDeltaX;
    const endY = startY + scaleFactor * newDeltaY;

    return [endX,endY];

  }


  function findFirstAndLastPointsOfLargestLines(points) {
    /// for a series of points, returns those that form horiz or vert lines
    /// omits shorter, redundant (internal) lines
    const subsequences = [];
    let currentHorizontalSubsequence = [];
    let currentVerticalSubsequence = [];

    // Helper function to check if two points form a horizontal line
    function isHorizontalLine(point1, point2) {
      return point1[1] === point2[1];
    }

    // Helper function to check if two points form a vertical line
    function isVerticalLine(point1, point2) {
      return point1[0] === point2[0];
    }

    for (let i = 1; i < points.length; i++) {
      if (isVerticalLine(points[i - 1], points[i])) {
        currentVerticalSubsequence.push(points[i - 1]);
        currentVerticalSubsequence.push(points[i]);
      } else if (currentVerticalSubsequence.length > 0) {
        subsequences.push(currentVerticalSubsequence);
        currentVerticalSubsequence = [];
      }
    }

    // Push any remaining subsequences
    if (currentHorizontalSubsequence.length > 0) {
      subsequences.push(currentHorizontalSubsequence);
    }
    if (currentVerticalSubsequence.length > 0) {
      subsequences.push(currentVerticalSubsequence);
    }

    // Extract the first and last points of each subsequence
    const result = subsequences.map((subsequence) => [
      subsequence[0], // First point
      subsequence[subsequence.length - 1], // Last point
    ]);

    return result;
  }


  function interpolateYValuesForX(squigglyLinePoints, targetX) {
    function interpolateYValue(points, x) {
      for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];

        if (x1 <= x && x <= x2) {
          // Calculate the interpolated y value using linear interpolation
          const t = (x - x1) / (x2 - x1);
          const interpolatedY = y1 + t * (y2 - y1);
          return interpolatedY;
        }
      }

      return null; // If x is outside the range of provided points
    }

    function getYValuesForX(points, x) {
      const yValues = [];

      for (const point of points) {
        const [px, py] = point;

        if (px === x) {
          yValues.push(py);
        }
      }

      return yValues;
    }

    const yValues = getYValuesForX(squigglyLinePoints, targetX);

    if (yValues.length === 0) {
      return "none"; // No matching x values
    }

    const interpolatedYValues = [];

    for (const xValue of yValues) {
      const interpolatedY = interpolateYValue(squigglyLinePoints, targetX);
      interpolatedYValues.push(interpolatedY);
    }

    return interpolatedYValues;
  }


  function findMinimumDistance(jaggedLine, p0, p1) {
    // for a series of points (jaggedLine), find the 
    let minDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < jaggedLine.length - 1; i++) {
      const pointA = jaggedLine[i];
      const pointB = jaggedLine[i + 1];

      // Check if the line segment defined by pointA and pointB intersects with the vertical line segment defined by p0 and p1
      if (
        ((pointA[0] >= Math.min(p0[0], p1[0]) && pointA[0] <= Math.max(p0[0], p1[0])) ||
        (pointB[0] >= Math.min(p0[0], p1[0]) && pointB[0] <= Math.max(p0[0], p1[0]))) &&
        (pointA[1] <= Math.max(p0[1], p1[1]) && pointB[1] >= Math.min(p0[1], p1[1]))
      ) {
        // Calculate the y-coordinate of the intercept using linear interpolation
        const yIntercept = pointA[1] + ((p0[0] - pointA[0]) / (pointB[0] - pointA[0])) * (pointB[1] - pointA[1]);

        // Check if the intercept is within the line segment between p0 and p1
        if (yIntercept >= Math.min(p0[1], p1[1]) && yIntercept <= Math.max(p0[1], p1[1])) {
          // Calculate the distance between the y-value of the intercept and either of the y-values of p0 and p1
          const distanceToP0 = Math.abs(yIntercept - p0[1]);
          const distanceToP1 = Math.abs(yIntercept - p1[1]);

          // Update minDistance if a smaller distance is found
          minDistance = Math.min(minDistance, distanceToP0, distanceToP1);
        }
      }
    }

    return minDistance;
  }


          
  function findIntercepts(jaggedLine, p0, p1) {
    const [x, _] = p0; // Extract the common x-value

    const intercepts = [];

    for (let i = 0; i < jaggedLine.length - 1; i++) {
      const pointA = jaggedLine[i];
      const pointB = jaggedLine[i + 1];

      // Check if the line segment defined by pointA and pointB intersects with the vertical line segment
      if (
        (pointA[0] <= x && pointB[0] >= x) ||
        (pointA[0] >= x && pointB[0] <= x)
      ) {
        // Calculate the y-coordinate of the intercept using linear interpolation
        const yIntercept = pointA[1] + ((x - pointA[0]) / (pointB[0] - pointA[0])) * (pointB[1] - pointA[1]);
        intercepts.push(yIntercept);
      }
    }

    return intercepts;
  }
          
  function findSmallestDistance(yIntercepts, p0y, p1y) {
    const distances = yIntercepts.map(y => Math.min(Math.abs(y - p0y), Math.abs(y - p1y))); // Calculate the smallest absolute differences from p0y and p1y

    return Math.min(...distances); // Find the minimum difference
  }


  ////////
  // D r a w i n g
  ///////


  var line1color = "black"; 
  var line1width = 3;

  var line2color = "#FF6B6B";
  var line2width = 2;

  (function() {
    var currentWidth = window.innerWidth; // Store the current width

    window.addEventListener('resize', function() {
      if (window.innerWidth !== currentWidth) { // Check if the width has changed
        currentWidth = window.innerWidth; // Update the current width
        resizeCanvas();
      }
    }, false);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = 135;
      drawStuff();
    }

    resizeCanvas();
  })();

  function drawStuff(){
    //
    // draws a boxy line
    // draws a squiggy line based on the boxy line
    //
    const x_val = 0
    const y_val = 100
    let history = [[x_val,y_val],];
    let current_x = x_val;
    let current_y = y_val;//current_y = x_val,y_val
    let box_upward = true;
    let box_centroids = [];
    let to_redraw = []
    //
    // initialize canvas
    context.beginPath();
    context.moveTo(x_val,y_val);

    while (current_x<canvas.width) {
      // lurch
      if (Math.random()<.4){
        current_x = current_x + getRandomNumber(100,150);
        history.push([current_x,current_y]);    
      }
      // box
      let box_points = box(current_x,current_y,up=box_upward);
      history.push(...box_points);
      box_points.unshift([current_x,current_y])
      current_x = box_points[3][0];
      current_y = box_points[3][1];
      box_centroids.push(randomPointBetweenCentroidAndMidpoint(box_points));
      // maybe change direction of boxes
      //to_redraw.push([box_points[0],box_points[1]])
      if (Math.random()<1){
        box_upward = !box_upward; //toggle
      }
    };
    // finish up
    history.push([canvas.width,current_y]); 


    //draw big shape that will be fixed
    history2 = [...history]
    const firstPoint = [0,history[0][1]]
    const lastPoint = [canvas.width,history[history.length - 1][1]]
    history2.unshift(firstPoint);
    history2.push(lastPoint);
    history2.unshift([0,0]);
    history2.push([canvas.width,0])
    context.fillStyle = 'white';
    context.beginPath();
    context.moveTo(0,0)
    history2.forEach(function(item){
      context.lineTo(...item);
    });
    context.closePath();
    context.fill();


    // actually draw
    context.beginPath();
    context.moveTo(0,90)
    history.forEach(function(item) {
      context.lineTo(...item);
      context.strokeStyle = line1color;
      context.lineWidth = line1width;
      context.stroke();
    });

    // finish up


    // draw second line
    chase_points = drawChaseLine(box_centroids);

    to_redraw = findFirstAndLastPointsOfLargestLines(history);


    to_redraw.forEach(function(item){
      if (Math.random()<100){
        intercepts = findIntercepts(chase_points,item[0],item[1]);
        sd = findSmallestDistance(intercepts,item[0][1],item[1][1]);
        if (sd>10){
          context.beginPath();
          context.moveTo(...item[0]);
          context.lineTo(...item[1]);
          context.globalAlpha = 1.0;
          context.strokeStyle = line1color;
          context.lineWidth = line1width;
          context.stroke();     
        }
      }
    });
    //trim right edge  
    //context.clearRect(canvas.width-100, 0, canvas.width-100, canvas.height);
  }


  function drawChaseLine(points) {
    // draws a line that chases a series of coordinates
    points.push([canvas.width + 10, 100]);

    const x_val = 0;
    const y_val = 90+getRandomNumber(-10,10);

    context.beginPath();
    context.moveTo(x_val, y_val);

    let current_x = x_val;
    let current_y = y_val;

    let chase_history = [];

    points.forEach(function(item) {
      let goal_x = item[0];
      let goal_y = item[1];
      let attempts = 100;
      while (calculateDistance(current_x, current_y, goal_x, goal_y) > 5 && attempts > 0) {
        let new_point = getPointsRandomLineTo(current_x, current_y, goal_x, goal_y, length = getRandomNumber(2,10));
        context.strokeStyle = line2color;
        context.lineWidth = line2width;
        context.lineTo(new_point[0], new_point[1]);
        context.stroke();
        current_x = new_point[0];
        current_y = new_point[1];
        chase_history.push(new_point);
        attempts -= 1;
      }
    });
    return chase_history;
  }
});
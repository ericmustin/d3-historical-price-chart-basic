// const loadData = d3.json('./js/sample-data.json').then(data => {
const urlParams = new URLSearchParams(window.location.search);
const ticker = urlParams.get("ticker")

const query = ticker ? `/api?ticker=${ticker}` : '/api'

const loadData = d3.json(query).then(data => {
  const stonk = document.getElementById('stonk');
  const chartResultsData = data['response'];

  const close = data['response'][0]['close']
  stonk.innerHTML = `$${data['ticker']}:${close.toFixed(2)} `

  return chartResultsData.map((stockDateInfo, index) => ({
    date: new Date(stockDateInfo['date'] * 1000),
    high: stockDateInfo['high'],
    low: stockDateInfo['low'],
    open: stockDateInfo['open'],
    close: stockDateInfo['close'],
    volume: stockDateInfo['volume']
  }));


}).catch( err => {
  console.log('error', err)
});

const movingAverage = (data, numberOfPricePoints) => {
  return data.map((row, index, total) => {
    const start = Math.max(0, index - numberOfPricePoints);
    const end = index;
    const subset = total.slice(start, end + 1);
    const sum = subset.reduce((a, b) => {
      return a + b['close'];
    }, 0);

    return {
      date: row['date'],
      average: sum / subset.length
    };
  });
};

loadData.then(data => {
  initialiseChart(data);
});

const resizeScenery = (width, aspect) => {
  let tree = document.getElementsByClassName("tree");
  let grass = document.getElementsByClassName("grass");
  let hill = document.getElementsByClassName("hill");
  let trunk = document.getElementsByClassName("trunk");
  let grassHeight = width / aspect * .1
  grass[0].setAttribute("style",`height:${grassHeight}px`);


}

// credits: https://brendansudol.com/writing/responsive-d3
const responsivefy = svg => {
  // get container + svg aspect ratio
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    aspect = width / height;

  // get width of container and resize svg to fit it
  const resize = () => {
    var targetWidth = parseInt(container.style('width'));
    svg.attr('width', targetWidth);
    svg.attr('height', Math.round(targetWidth / aspect));

    resizeScenery(targetWidth, aspect)
  };

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid')
    .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on('resize.' + container.attr('id'), resize);
};

const initialiseChart = data => {
  data = data.filter(
    row => row['high'] && row['low'] && row['close'] && row['open']
  );

  thisYearStartDate = new Date(2018, 0, 1);

  // filter out data based on time period
  data = data.filter(row => {
    if (row['date']) {
      return row['date'] >= thisYearStartDate;
    }
  });

  const margin = { top: 0, right: 0, bottom: window.innerHeight*.1, left: 0 };
  const width = window.innerWidth - margin.left - margin.right; // Use the window's width
  const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

  // find data range
  const xMin = d3.min(data, d => {
    return d['date'];
  });

  const xMax = d3.max(data, d => {
    return d['date'];
  });

  const yMin = d3.min(data, d => {
    return d['close'];
  });

  const yMax = d3.max(data, d => {
    return d['close'];
  });

  // scale using range
  const xScale = d3
    .scaleTime()
    .domain([xMin, xMax])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([yMin - 5, yMax])
    .range([height, 250]);

  // add chart SVG to the page
   let svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin['left'] + margin['right'])
    .attr('height', height + margin['top'] + margin['bottom'])
    .call(responsivefy)

    svg = svg.append('g')

    let defs = svg.append("defs");

    const pattern = defs
      .append("pattern")
      .attr("id", `top-pattern`)
      .attr("height", 0.1)
      .attr("width", 1);

    let lineargrad = svg.append('linearGradient')
    .attr('id','skygrad')
    .attr('y1', '0%')
    .attr('y2', '100%')
    .attr('x2', '0')
    .attr('gradientUnits', 'userSpaceOnUse')

    lineargrad.append('stop')
    .attr('offset', '0%')
    .attr('stop-color',"#154277")

    lineargrad.append('stop')
    .attr('offset', '30%')
    .attr('stop-color',"#576e71")

    lineargrad.append('stop')
    .attr('offset', '100%')
    .attr('stop-color',"#b26339")  


    let lineargradMountain = svg.append('linearGradient')
    .attr('id','mountaingrad')
    // .attr('x1', '0')
    .attr('y1', '0%')
    .attr('y2', '100%')
    .attr('x2', '0')
    .attr('gradientUnits', 'userSpaceOnUse')

    lineargradMountain.append('stop')
    .attr('offset', '0%')
    .attr('stop-color',"#fffafa")

    lineargradMountain.append('stop')
    .attr('offset', '40%')
    .attr('stop-color',"rgb(225, 236, 242)")

    lineargradMountain.append('stop')
    .attr('offset', '51%')
    .attr('stop-color',"#4a4969")    

    lineargradMountain.append('stop')
    .attr('offset', '100%')
    .attr('stop-color',"#4a4969")  

    // .attr('transform', `translate(${margin['left']}, ${margin['top']})`);

  // create the axes component
  // svg
  //   .append('g')
  //   .attr('id', 'xAxis')
  //   .attr('transform', `translate(0, ${height})`)
  //   .call(d3.axisBottom(xScale));

  // svg
  //   .append('g')
  //   .attr('id', 'yAxis')
  //   .attr('transform', `translate(${width}, 0)`)
  //   .call(d3.axisRight(yScale));

  // renders close price line chart and moving average line chart

  // generates lines when called
  const line = d3
    .line()
    .x(d => {
      return xScale(d['date']);
    })
    .y(d => {
      return yScale(d['close']);
    });

  const area = d3
    .area()
    .x(d => {
      return xScale(d['date']);
    })
    .y1(height)   
    .y0(d => {
      return yScale(d['close']);
    });

  const negativeArea = d3
    .area()
    .x(d => {
      return xScale(d['date']);
    })
    .y1(0)   
    .y0(d => {
      return yScale(d['close']);
    });

  const movingAverageLine = d3
    .line()
    .x(d => {
      return xScale(d['date']);
    })
    .y(d => {
      return yScale(d['average']);
    })
    .curve(d3.curveBasis);



  svg
    .append('path')
    .data([data]) // binds data to the line
    .style('fill', "#4a4969")
    // .style('fill', '#888')
    // .attr('stroke', 'blue')
    .attr("class", "area")
    // .attr("opacity", "1")
    .attr("d", area); 

  svg
    .append('path')
    .data([data]) // binds data to the line
    .style('fill', "url(#skygrad)")
    .attr("class", "sky")
    .attr("opacity", "1")
    .attr("d", negativeArea); 

  svg
    .append('path')
    .data([data]) // binds data to the line
    .style('fill', 'none')
    .attr('id', 'priceChart')
    .attr('stroke', 'fffafa')
    .attr('stroke-width', '1.5')
    .attr('d', line); 

  svg
    .append('circle')
    .attr('cx',"90%")
    .attr('cy',"10%")
    .attr('r',"40")
    .attr('stroke',"#edf2f7")
    .attr('stroke-width',"3")
    .attr('fill',"#edf2f7")
    

  // calculates simple moving average over 50 days
  // const movingAverageData = movingAverage(data, 49);
  // svg
  //   .append('path')
  //   .data([movingAverageData])
  //   .style('fill', 'none')
  //   .attr('id', 'movingAverageLine')
  //   .attr('stroke', '#FF8900')
  //   .attr('d', movingAverageLine);

  // renders x and y crosshair
  const focus = svg
    .append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  focus.append('circle').attr('r', 4.5);
  focus.append('line').classed('x', true);
  focus.append('line').classed('y', true);

  // svg
  //   .append('rect')
  //   .attr('class', 'overlay')
  //   .attr('width', width)
  //   .attr('height', height)
    // .on('mouseover', () => focus.style('display', null))
    // .on('mouseout', () => focus.style('display', 'none'))
    // .on('mousemove', generateCrosshair);

  // d3.select('.overlay').style('fill', 'none');
  // d3.select('.overlay').style('pointer-events', 'all');

  // d3.selectAll('.focus line').style('fill', 'none');
  // d3.selectAll('.focus line').style('stroke', '#67809f');
  // d3.selectAll('.focus line').style('stroke-width', '1.5px');
  // d3.selectAll('.focus line').style('stroke-dasharray', '3 3');

  //returs insertion point
  // const bisectDate = d3.bisector(d => d.date).left;

  // /* mouseover function to generate crosshair */
  // function generateCrosshair() {
  //   //returns corresponding value from the domain
  //   const correspondingDate = xScale.invert(d3.mouse(this)[0]);
  //   //gets insertion point
  //   const i = bisectDate(data, correspondingDate, 1);
  //   const d0 = data[i - 1];
  //   const d1 = data[i];
  //   const currentPoint =
  //     correspondingDate - d0['date'] > d1['date'] - correspondingDate ? d1 : d0;
  //   focus.attr(
  //     'transform',
  //     `translate(${xScale(currentPoint['date'])}, ${yScale(
  //       currentPoint['close']
  //     )})`
  //   );

  //   focus
  //     .select('line.x')
  //     .attr('x1', 0)
  //     .attr('x2', width - xScale(currentPoint['date']))
  //     .attr('y1', 0)
  //     .attr('y2', 0);

  //   focus
  //     .select('line.y')
  //     .attr('x1', 0)
  //     .attr('x2', 0)
  //     .attr('y1', 0)
  //     .attr('y2', height - yScale(currentPoint['close']));

  //   // updates the legend to display the date, open, close, high, low, and volume of the selected mouseover area
  //   updateLegends(currentPoint);
  // }

  // /* Legends */
  // const updateLegends = currentData => {
  //   d3.selectAll('.lineLegend').remove();

  //   const legendKeys = Object.keys(data[0]);
  //   const lineLegend = svg
  //     .selectAll('.lineLegend')
  //     .data(legendKeys)
  //     .enter()
  //     .append('g')
  //     .attr('class', 'lineLegend')
  //     .attr('transform', (d, i) => {
  //       return `translate(0, ${i * 20})`;
  //     });
  //   lineLegend
  //     .append('text')
  //     .text(d => {
  //       if (d === 'date') {
  //         return `${d}: ${currentData[d].toLocaleDateString()}`;
  //       } else if (
  //         d === 'high' ||
  //         d === 'low' ||
  //         d === 'open' ||
  //         d === 'close'
  //       ) {
  //         return `${d}: ${currentData[d].toFixed(2)}`;
  //       } else {
  //         return `${d}: ${currentData[d]}`;
  //       }
  //     })
  //     .style('fill', 'white')
  //     .attr('transform', 'translate(15,9)'); //align texts with boxes
  // };

  // /* Volume series bars */
  // const volData = data.filter(d => d['volume'] !== null && d['volume'] !== 0);

  // const yMinVolume = d3.min(volData, d => {
  //   return Math.min(d['volume']);
  // });

  // const yMaxVolume = d3.max(volData, d => {
  //   return Math.max(d['volume']);
  // });

  // const yVolumeScale = d3
  //   .scaleLinear()
  //   .domain([yMinVolume, yMaxVolume])
  //   .range([height, height * (3 / 4)]);

//   svg
//     .selectAll()
//     .data(volData)
//     .enter()
//     .append('rect')
//     .attr('x', d => {
//       return xScale(d['date']);
//     })
//     .attr('y', d => {
//       return yVolumeScale(d['volume']);
//     })
//     .attr('class', 'vol')
//     .attr('fill', (d, i) => {
//       if (i === 0) {
//         return '#03a678';
//       } else {
//         return volData[i - 1].close > d.close ? '#c0392b' : '#03a678'; // green bar if price is rising during that period, and red when price  is falling
//       }
//     })
//     .attr('width', 1)
//     .attr('height', d => {
//       return height - yVolumeScale(d['volume']);
//     });
//   // testing axis for volume
//   /*
//   svg.append('g').call(d3.axisLeft(yVolumeScale));
//   */
};

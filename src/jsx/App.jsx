import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://alligator.io/react/axios-react/
import axios from 'axios';

// https://www.npmjs.com/package/react-div-100vh
import Div100vh from 'react-div-100vh';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
import {geoRobinson} from 'd3-geo-projection';

// https://www.npmjs.com/package/topojson
// import * as topojson from 'topojson';

const yearStart = 1901,
      yearEnd = 2020,
      scaleMax = 3,
      scaleMin = -3,
      avg_temps = [-0.15,-0.28,-0.37,-0.47,-0.26,-0.22,-0.39,-0.43,-0.48,-0.43,-0.44,-0.36,-0.34,-0.15,-0.14,-0.36,-0.46,-0.3,-0.27,-0.27,-0.19,-0.29,-0.27,-0.27,-0.22,-0.11,-0.22,-0.2,-0.36,-0.16,-0.1,-0.16,-0.29,-0.12,-0.2,-0.15,-0.03,0,-0.02,0.12,0.18,0.06,0.09,0.2,0.09,-0.07,-0.03,-0.11,-0.11,-0.17,-0.07,0.01,0.08,-0.13,-0.14,-0.19,0.05,0.06,0.03,-0.03,0.06,0.03,0.05,-0.2,-0.11,-0.06,-0.02,-0.08,0.05,0.03,-0.08,0.01,0.16,-0.07,-0.01,-0.1,0.18,0.07,0.16,0.26,0.32,0.14,0.31,0.16,0.12,0.18,0.32,0.39,0.27,0.45,0.41,0.22,0.23,0.32,0.45,0.33,0.47,0.61,0.39,0.4,0.54,0.63,0.62,0.54,0.68,0.64,0.66,0.54,0.66,0.72,0.61,0.65,0.68,0.74,0.9,1.01,0.92,0.85,0.98,1.02],
      intervalTimeout = 150;
// Use chroma to make the color scale.
const f = chroma.scale('RdYlBu').domain([scaleMax,0,scaleMin]);

let scales = [], temperature = scaleMax, svg;
while (temperature > scaleMin) {
  temperature = temperature - 0.05;
  scales.push(temperature);
}
const margin = {top: 0, right: 0, bottom: 0, left: 0};
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;
const xScale = d3.scaleLinear()
  .range([0, 200])
  .domain([-1, 119]);
const yScale = d3.scaleLinear()
  .range([40, 0])
  .domain([-1, 1]);

// Use this to run three different versions (fullscreen, square and portrait)
let g, interval;
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      controls_text:'Play',
      current_year_average_temp:null,
      interval_play:false,
      year:yearStart
    }
  }
  componentDidMount() {
    // Get data.
    svg = d3.select('.' + style.map_container)
      .append('svg')
      .attr('height', height)
      .attr('width', width);
    axios.get('./data/data.json')
    .then((response) => {
      // temperature[0].data.reduce((total, current) => total + current.value, 0) / temperature[0].data.length
      this.setState((state, props) => ({
        current_data:response.data[yearStart],
        data:response.data
      }), this.loadMapData);
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  loadMapData() {
    d3.json('./data/world_countries.json').then(data => {
      this.drawMap(data)
    });
  }
  value2color(value) {
    // Return color from chroma based on value.
    return f(value);
  }
  createLineChart() {
    svg.select('.' + style.line_container).append('svg')
      .attr('height', '200px')
      .attr('width', '400px')
    const line_container = svg.append('g')
      .attr('class', style.line_container)
      .attr('transform', 'translate(' + (window.innerWidth - 210) + ', 20)');
    line_container.append('text')
      .attr('x', 5)
      .attr('class', style.linegraptext)
      .html('world');
    line_container.append('g')
      .attr('class', style.grid)
      .call(d3.axisLeft(yScale)
        .ticks(1)
        .tickFormat(i => i + '°C')
        .tickSizeInner(-200)
        .tickSizeOuter(0)
      );
    // Add the lines.
    line_container.append('path')
      .attr('class', style.current_avg_temp_line)
      .data([]);
  }
  updateLineChart() {
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d));
    d3.select('.' + style.current_avg_temp_line)
      .attr('class', style.current_avg_temp_line)
      .style('stroke', '#000')
      .attr('d', line(avg_temps.slice(0, this.state.year - 1900)));
  }
  drawMap(data) {
    this.createLineChart();
    //  http://bl.ocks.org/micahstubbs/535e57a3a2954a129c13701fe61c681d    
    svg.append('g')
      .attr('class', style.map);

    // https://observablehq.com/@d3/robinson
    const path = d3.geoPath().projection(geoRobinson()
      .rotate([0, 0, 0])
      .scale((width * 300) / 1650)
      .translate([width / 2 - (width * 100) / 1650, height / 2 + (width * 50) / 1650]));

    g = svg.append('g');
    g.attr('class', 'countries')
      .selectAll('path')
      .data(data.features)
      .enter().append('path')
        .attr('d', path)
        .attr('fill', (d, i) => {
          return this.value2color(0);
        })
        .style('opacity', 1)
        .style('stroke', '#fff')
        .style('stroke-width', 0.3);
    this.setPathColor();
    this.getCurrentYearAverageTemp();
    // Wait 2 seconds before starting the interval.
    setTimeout(() => {
      this.toggleInterval(yearStart);
    }, 2000);
  }
  toggleInterval(year) {
    if (parseInt(year) === yearEnd) {
      year = yearStart
    }
    // If interval is already running, stop it.
    if (this.state.interval === true) {
      clearInterval(interval);
      this.setState((state, props) => ({
        controls_text:'Play',
        interval:false,
      }));
    }
    else {
      interval = setInterval(() => {
        // If we are in the end.
        if (year > yearEnd) {
          clearInterval(interval);
          this.setState((state, props) => ({
            controls_text:'Play',
            interval:false,
          }));
        }
        else {
          this.setState((state, props) => ({
            controls_text:'Pause',
            current_data:this.state.data[year],
            interval:true,
            year:year
          }), () => this.setPathColor());
          year++;
        }
      }, intervalTimeout);
    }
  }
  setPathColor() {
    this.updateLineChart();
    let data = this.state.data[this.state.year].map((values) => {
      return {
        country:values.country,
        data:values.data.reduce((total, current) => total + current.value, 0) / values.data.length
      }
    });
    g.selectAll('path')
      .attr('fill', (d, i) => {
        let country_data = data.filter(obj => {
          return obj.country === d.id
        });
        if (country_data[0]) {
          return this.value2color(country_data[0].data);
        }
        else {
          return this.value2color(0);
        }
      });
    this.getCurrentYearAverageTemp();
  }
  getCurrentYearAverageTemp() {
    // let temperature = this.state.current_data.reduce((total, current) => total + (current.data.reduce((country_total, country_current) => country_total + country_current.value, 0)) / current.data.length, 0) / this.state.current_data.length;
    let temperature = avg_temps[this.state.year - 1901];
    this.setState((state, props) => ({
      active_country_temp:temperature,
      current_year_average_temp:temperature
    }));
  }
  handleYearChange(event) {
    // If year is changed manually we stop the interval.
    clearInterval(interval);
    let year = event.target.value;
    this.setState((state, props) => ({
      controls_text:'Play',
      current_data:this.state.data[year],
      interval:false,
      year:year
    }), () => this.setPathColor());
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <Div100vh>
          <div className={style.title_container}>
            <h3>Temperature anomalies</h3>
            <div className={style.info_container}>
              <div>World data: <a href="https://data.giss.nasa.gov/gistemp/">NASA</a></div>
              <div>Country data: <a href="https://climateknowledgeportal.worldbank.org/download-data">World Bank</a></div>
              <div>Author: <a href="https://twitter.com/teelmo">Teemo Tebest</a>, EBU</div>
              <div>Reference period: 1951–1980</div>
            </div>
          </div>
          <div className={style.map_container}></div>
          <div className={style.line_container}></div>
          <div className={style.meta_container}>
            <div className={style.year_container}>{this.state.year}</div>
            <div className={style.range_container} ref={this.rangeContainerRef}>
              <input type="range" min={yearStart} value={this.state.year} max={yearEnd} onChange={(event) => this.handleYearChange(event)} />
            </div>
            <div className={style.controls_container} ref={this.controlsContainerRef} onClick={() => this.toggleInterval(this.state.year)}>{this.state.controls_text}</div>
          </div>
          <div className={style.scales_container}>
            {
              // The scale on the right.
              scales.map((scale, i) => {
                // Place the yearly marker.
                if (this.state.current_year_average_temp !== null && this.state.current_year_average_temp > scale  && this.state.current_year_average_temp < (scale + 0.05)) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:'#fff'}}><div className={style.scale_text}><div className={style.year_text}>{this.state.year}</div><div>{(this.state.current_year_average_temp > 0 ? '+' : '') + this.state.current_year_average_temp.toFixed(1)}°C</div></div></div>);
                }
                // Place the zero point (disabled by css on default).
                else if (scale > -0.025 && scale < 0.025) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale), borderBottom:'1px dashed rgba(255, 255, 255, 0.3)'}}><div className={style.scale_text_zero}><div>0°C</div></div></div>);
                }
                // Place the initial value.
                else if (scale < -0.075 && scale > -0.125) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale), borderBottom:'1px dashed rgba(255, 255, 255, 0.3)'}}><div className={style.scale_text_1901}><div>-0.1°C</div></div></div>);
                }
                else {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale)}}></div>);
                }
              })
            }
          </div>
        </Div100vh>
      </div>
    );
  }
}
export default App;
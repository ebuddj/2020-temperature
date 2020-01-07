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

// Use chroma to make the color scale.
const f = chroma.scale('RdYlBu').padding([-0.35,-0.35]).domain([2,0,-2]);

const yearStart = 1901,
      yearEnd = 2016,
      scaleMax = 2,
      scaleMin = -2,
      intervalTimeout = 300,
      countries = {'AFG':'Afghanistan','ALB':'Albania','DZA':'Algeria','AND':'Andorra','AGO':'Angola','ATG':'Antigua and Barbuda','ARG':'Argentina','ARM':'Armenia','AUS':'Australia','AUT':'Austria','AZE':'Azerbaijan','BHS':'Bahamas','BHR':'Bahrain','BGD':'Bangladesh','BRB':'Barbados','BLR':'Belarus','BEL':'Belgium','BLZ':'Belize','BEN':'Benin','BTN':'Bhutan','BOL':'Bolivia','BIH':'Bosnia and Herzegovina','BWA':'Botswana','BRA':'Brazil','BRN':'Brunei Darussalam','BGR':'Bulgaria','BFA':'Burkina Faso','BDI':'Burundi','KHM':'Cambodia','CMR':'Cameroon','CAN':'Canada','CPV':'Cabo Verde','CAF':'Central African Republic','TCD':'Chad','CHL':'Chile','CHN':'China','COL':'Colombia','COM':'Comoros','COD':'Congo-Kinshasa','COG':'Congo-Brazzaville','CRI':'Costa Rica','CIV':'Côte d\'Ivoire','HRV':'Croatia','CUB':'Cuba','CYP':'Cyprus','CZE':'Czechia','DNK':'Denmark','DJI':'Djibouti','DMA':'Dominica','DOM':'Dominican Republic','ECU':'Ecuador','EGY':'Egypt','SLV':'El Salvador','GNQ':'Equatorial Guinea','ERI':'Eritrea','EST':'Estonia','ETH':'Ethiopia','FRO':'Faroe Islands','FSM':'Micronesia','FJI':'Fiji','FIN':'Finland','FRA':'France','GAB':'Gabon','GMB':'Gambia','GEO':'Georgia','DEU':'Germany','GHA':'Ghana','GRC':'Greece','GRL':'Greenland','GRD':'Grenada','GTM':'Guatemala','GIN':'Guinea','GNB':'Guinea-Bissau','GUY':'Guyana','HTI':'Haiti','HND':'Honduras','HUN':'Hungary','ISL':'Iceland','IND':'India','IDN':'Indonesia','IRN':'Iran','IRQ':'Iraq','IRL':'Ireland','ISR':'Israel','ITA':'Italy','JAM':'Jamaica','JPN':'Japan','JOR':'Jordan','KAZ':'Kazakhstan','KEN':'Kenya','KIR':'Kiribati','PRK':'North Korea','KOR':'South Korea','KWT':'Kuwait','KGZ':'Kyrgyzstan','LAO':'Lao','LVA':'Latvia','LBN':'Lebanon','LSO':'Lesotho','LBR':'Liberia','LBY':'Libya','LIE':'Liechtenstein','LTU':'Lithuania','LUX':'Luxembourg','MKD':'Republic of North Macedonia','MDG':'Madagascar','MWI':'Malawi','MYS':'Malaysia','MDV':'Maldives','MLI':'Mali','MLT':'Malta','MHL':'Marshall Islands','MRT':'Mauritania','MUS':'Mauritius','MEX':'Mexico','MDA':'Moldova','MCO':'Monaco','MNG':'Mongolia','MAR':'Morocco','MOZ':'Mozambique','MMR':'Myanmar','NAM':'Namibia','NPL':'Nepal','NLD':'Netherlands','NCL':'New Caledonia','NZL':'New Zealand','NIC':'Nicaragua','NER':'Niger','NGA':'Nigeria','MNP':'Northern Mariana Islands','NOR':'Norway','OMN':'Oman','PAK':'Pakistan','PLW':'Palau','PAN':'Panama','PNG':'Papua New Guinea','PRY':'Paraguay','PER':'Peru','PHL':'Philippines','POL':'Poland','PRT':'Portugal','PRI':'Puerto Rico','QAT':'Qatar','MNE':'Montenegro','SRB':'Serbia','ROU':'Romania','RUS':'Russian Federation','RWA':'Rwanda','WSM':'Samoa','STP':'Sao Tome and Principe','SAU':'Saudi Arabia','SEN':'Senegal','SYC':'Seychelles','SLE':'Sierra Leone','SGP':'Singapore','SVK':'Slovakia','SVN':'Slovenia','SLB':'Solomon Islands','SOM':'Somalia','ZAF':'South Africa','SSD':'South Sudan','ESP':'Spain','LKA':'Sri Lanka','KNA':'Saint Kitts and Nevis','LCA':'Saint Lucia','VCT':'Saint Vincent and the Grenadines','SDN':'Sudan','SUR':'Suriname','SWZ':'Eswatini','SWE':'Sweden','CHE':'Switzerland','SYR':'Syrian Arab Republic','TJK':'Tajikistan','TZA':'Tanzania','THA':'Thailand','TLS':'Timor-Leste','TGO':'Togo','TON':'Tonga','TTO':'Trinidad and Tobago','TUN':'Tunisia','TUR':'Turkey','TKM':'Turkmenistan','TUV':'Tuvalu','UGA':'Uganda','UKR':'Ukraine','ARE':'United Arab Emirates','GBR':'United Kingdom','USA':'United States of America','URY':'Uruguay','UZB':'Uzbekistan','VUT':'Vanuatu','VEN':'Venezuela','VNM':'Viet Nam','YEM':'Yemen','ZMB':'Zambia','ZWE':'Zimbabwe'};

// Use this to run three different versions (fullscreen, square and portrait)
const videoMode = false;
let g, interval;
class App extends Component {
  constructor(props) {
    super(props);

    // Define refs.
    this.containerRef = React.createRef();

    this.state = {
      controls_text:'Play',
      current_year_average_temp:null,
      interval_play:false,
      year:yearStart
    }
  }
  componentDidMount() {
    // Get data.
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
  loadMapData() {
    d3.json('./data/world_countries.json').then(data => {
      this.drawMap(data)
    });
  }
  value2color(value) {
    // Return color from chroma based on value.
    return f(value);
  }
  drawMap(data) {
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;
    const svg = d3.select('.' + style.map_container)
      .append('g')
      .append('svg')
      .attr('class', style.map)
      .attr('height', height)
      .attr('width', width);

    // https://observablehq.com/@d3/robinson
    const projection = geoRobinson()
      .rotate([0, 0, 0])
      .scale(180)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
    g = svg.append('g');
    g.attr('class', 'countries')
      .selectAll('path')
      .data(data.features)
      .enter().append('path')
        .attr('d', path)
        .attr('fill', (d, i) => {
          return this.value2color(0);
        })
        .style('stroke', 'white')
        .style('opacity', 0.8)
        .style('stroke-width', 0.3);

    this.getCurrentYearAverageTemp();
    // Wait 2 seconds before starting the interval.
    setTimeout(() => {
      this.toggleInterval(yearStart);
    }, 2000);
  }
  toggleInterval(year) {
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
          }), this.setPathColor);
          year++
        }
      }, intervalTimeout);
    }
  }
  setPathColor() {
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
  getCurrentYearAverageTemp() {
    let temperature = this.state.current_data.reduce((total, current) => total + (current.data.reduce((country_total, country_current) => country_total + country_current.value, 0)) / current.data.length, 0) / this.state.current_data.length;
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
    }), this.setPathColor);
  }
  
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    let scales = [], temperature = scaleMax;
    while (temperature > scaleMin) {
      temperature = temperature - 0.05;
      scales.push(temperature);
    }
    return (
      <div className={style.app}>
        <Div100vh>
          <div className={style.map_container}></div>
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
                else if (scale < -0.625 && scale > -0.675) {
                  return (<div key={i} className={style.scale_container} style={{backgroundColor:this.value2color(scale), borderBottom:'1px dashed rgba(255, 255, 255, 0.3)'}}><div className={style.scale_text_1901}><div>-0.6°C</div></div></div>);
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
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import './App.css';

class ChloroBubble extends Component {

  state = {
    us: null,
    guns: null,
    poverty: null
  }

  componentWillMount() {
    d3.queue()
      .defer(d3.json, "data/us.json")
      .defer(d3.csv, "data/guns-history.csv")
      .defer(d3.csv, "data/PovertyData.csv")
      .await((error, us, guns, poverty) => {

          this.setState({
            us,
            guns,
            poverty
          });
      })
  }

  componentDidUpdate() {
    const svg = d3.select(this.refs.anchor),
      { width, height } = this.props;

    const us = this.state.us,
      guns = this.state.guns,
      poverty = this.state.poverty;

      const gunsLookup = {};
      guns.forEach(function(d) {
        gunsLookup[d.FIPS] = d.count3;
      })

      const povertyLookup = {};
      poverty.forEach(function(d) {
        d.PCTPOVALL_2014 = +d.PCTPOVALL_2014
        d.FIPStxt = +d.FIPStxt;
        povertyLookup[d.FIPStxt] = d.PCTPOVALL_2014;

      })

      const counties = topojson.feature(us, us.objects.counties),
          states = topojson.feature(us, us.objects.states);

      const path = d3.geoPath()
          .projection(d3.geoAlbersUsa()
            .fitSize([width, height], counties));

      const colorScale = d3.scaleThreshold()
          .domain([0, 8, 12, 16, 20, 24, 30, 45])
          .range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]);

      const g = svg.append("g")
          .attr("class", "key")
          .attr("transform", "translate(20,0)");

      const x = d3.scaleLinear()
          .domain(d3.extent(poverty, function(d) { return d.PCTPOVALL_2014 }))
          .range([0, width/2]);

      g.selectAll("rect")
          .data(colorScale.range().map(function(d, i) {
            return {
              y0: i ? x(colorScale.domain()[i - 1]) : x.range()[0],
              y1: i < colorScale.domain().length ? x(colorScale.domain()[i]) : x.range()[1],
              z: d
            };
          }))





      const countyPaths = svg.selectAll(".counties")
          .data(counties.features)
          .enter().append("path")
          .attr("class", "counties")
          .style("fill", function(d) {
            return colorScale(povertyLookup[d.id]);
          })
          .attr("d", function(d) { return path(d); })

      const statePaths = svg.selectAll(".states")
            .data(states.features)
            .enter().append("path")
            .attr("class", "states")
            .attr("d", function(d) { return path(d); })


      const gunColorScale = d3.scaleThreshold()
        .domain([1,910,1107,1880,2716,15782])
        .range(["#fff","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a"]);

      const gunBubbles = svg.selectAll(".bubbles")
          .data(counties.features)
          .enter().append("circle")
          .attr("class", "bubbles")
          .attr("r", function(d) { return Math.sqrt(gunsLookup[d.id])/Math.PI  })
          .attr("cx", function(d) { return path.centroid(d)[0] })
          .attr("cy", function(d) { return path.centroid(d)[1] })
          .style("fill", function(d) { return gunColorScale(gunsLookup[d.id]); })

    d3.selectAll("button")
      .on("click", function() {
        console.log(this.id);

        const bubbleType = this.id;

        d3.selectAll(".bubbles")
            .transition()
            .duration(1200)
            .attr("r", function(d) {
              return (bubbleType == "bubblesOff" ? 0 : Math.sqrt(gunsLookup[d.id])/Math.PI)
            })

      })

}

  render() {
    const { us, guns, poverty } = this.state;

    if(!us || !guns || !poverty) {
      return null;
    }
    return <g ref="anchor" />;
  }
}

export default ChloroBubble;

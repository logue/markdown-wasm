/**
Generates benchmark graphs using d3.
Intended to be run as a CLI script, accepting a single argument: CSV file from bench.js

Copyright (c) 2019-2020 Rasmus Andersson <https://rsms.me/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';

import D3Node from 'd3-node';
import * as d3 from 'd3';
import { optimize } from 'svgo';

/**
 * Main
 */
function main() {
  if (process.argv.length < 3) {
    console.error(
      `
      usage: graph.js <csvfile>
      <csvfile> should be a file produced by bench.js (or one with identical format)
    `
        .trim()
        .replace(/\n\s+/g, '\n')
    );
    process.exit(1);
  }

  const data = loadData(process.argv[2]);
  const outdir = dirname(resolve(process.argv[2]));
  // console.log({data})

  const commonGraphConfig = {
    width: 840, // ~ width of images on github
    fontSize: 16,
    color: d3.scaleOrdinal(d3.schemeTableau10),
    // color: d3.scaleOrdinal().range(["#111", "#333", "#555", "#777", "#999"]),
  };

  writefile(
    outdir,
    'avg-ops-per-sec.svg',
    createBarChart(data, 'avg_ops', {
      ...commonGraphConfig,
      format: d3.format(',.0f'),
    })
  );

  writefile(
    outdir,
    'avg-throughput.svg',
    createBarChart(data, 'avg_throughput', {
      ...commonGraphConfig,
      xAxisFormat: ',.0f',
      xAxisTickCount: commonGraphConfig.width / 50,
      format: mb => {
        const bytes = mb * 1024000;
        return bytes <= 1024
          ? `${bytes.toFixed(0)}B/s`
          : bytes <= 1024000
            ? `${(bytes / 1024).toFixed(0)}kB/s`
            : bytes <= 1024000000
              ? `${(bytes / 1024000).toFixed(0)}MB/s`
              : `${(bytes / 1024000000).toFixed(0)}GB/s`;
      },
    })
  );

  const rangeData = data.map(d => ({
    name: d.name,
    min: 1000000000 / d.max_ops, // convert to nanoseconds/op
    max: 1000000000 / d.min_ops, // convert to nanoseconds/op
  }));
  writefile(
    outdir,
    'minmax-parse-time.svg',
    createMinMaxBarChart(rangeData, {
      ...commonGraphConfig,
      format: ns =>
        ns <= 1000
          ? `${ns.toFixed(0)}ns`
          : ns <= 1000000
            ? `${(ns / 1000).toFixed(1)}us`
            : ns <= 1000000000
              ? `${(ns / 1000000).toFixed(1)}ms`
              : `${(ns / 1000000000).toFixed(1)}s`,
    })
  );

  // const stackedData = data.slice()
  // stackedData.columns = ["name", "min_ops", "mean_ops", "max_ops"]
  // writefile(outdir, "min-mean-max-candlestick.svg", createStackedBarChart(
  //   stackedData,
  //   {...commonGraphConfig}
  // ))
}

/**
 * Load CSV file
 * @param {string} csvfile
 * @return {array}
 */
function loadData(csvfile) {
  const csvText = readFileSync(csvfile, 'utf8');

  const libraries = {};
  const fileset = new Set();

  d3.csvParse(csvText, d => {
    const lib = libraries[d.library] || (libraries[d.library] = {});
    const ops_sec = parseFloat(d['ops/sec']);
    const filesize = parseInt(d['filesize']);
    fileset.add(d.file);
    lib[d.file] = { ops_sec, filesize };
  });

  const data = [];
  // const files = Array.from(fileset);

  for (const library of Object.keys(libraries)) {
    const files = libraries[library];
    const filenames = Object.keys(files);

    // ops/sec
    const ops_values = filenames.map(filename => files[filename].ops_sec);
    ops_values.sort((a, b) => (a < b ? -1 : b < a ? 1 : 0));
    const avg_ops = vmath_avg(ops_values);
    const min_ops = ops_values[0];
    const max_ops = ops_values[ops_values.length - 1];
    const mean_ops = ops_values[Math.floor(ops_values.length / 2)];
    const sum_ops = ops_values.reduce((a, v) => a + v, 0);

    // throughput in megabytes
    const throughput_values = filenames.map(
      k => (files[k].ops_sec * files[k].filesize) / 1024000
    );
    throughput_values.sort((a, b) => (a < b ? -1 : b < a ? 1 : 0));
    const avg_throughput = vmath_avg(throughput_values);
    const min_throughput = throughput_values[0]; // Math.min(...throughput_values)
    const max_throughput = throughput_values[throughput_values.length - 1];
    const mean_throughput =
      throughput_values[Math.floor(throughput_values.length / 2)];
    const sum_throughput = throughput_values.reduce((a, v) => a + v, 0);

    data.push({
      name: library,
      ops: ops_values,
      throughput: throughput_values,
      avg_ops,
      min_ops,
      max_ops,
      mean_ops,
      sum_ops,
      avg_throughput,
      min_throughput,
      max_throughput,
      mean_throughput,
      sum_throughput,
    });
  }

  return data;
}

/**
 * Iterative mean
 *
 * @param {number[]} numbers
 * @return {number}
 */
function vmath_avg(numbers) {
  // http://www.heikohoffmann.de/htmlthesis/node134.html
  let avg = 0.0;
  let t = 1;
  for (const x of numbers) {
    avg += (x - avg) / t;
    ++t;
  }
  return avg;
}

const fontFamily = `system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif`;
const xAxisLabelOpacity = 0.5;

/**
 * dataValueKey should be one of the following strings:
 *
 *   avg_ops
 *   min_ops
 *   max_ops
 *   mean_ops
 *   sum_ops
 *   avg_throughput
 *   min_throughput
 *    max_throughput
 *    mean_throughput
 *   sum_throughput
 *
 * @param {*} data
 * @param {*} dataValueKey
 * @param {*} graphConfig
 * @return {string}
 */
function createBarChart(data, dataValueKey, graphConfig) {
  const size = graphConfig.fontSize || 14;
  const xAxisLabelSize = Math.round(size * 10 * 0.8) / 10;
  const longestYAxisName = data.reduce((a, d) => Math.max(a, d.name.length), 0);
  const yAxisMinWidth = size * 0.75 * longestYAxisName; // guesstimate text length
  const margin = {
    top: size * 3,
    right: size,
    bottom: size * 2,
    left: yAxisMinWidth,
  };
  const barHeight = Math.round(size * 2.25);
  const labelPadding = Math.round(barHeight * 0.15);
  const height =
    Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
  const width = graphConfig.width || 600;
  const format = graphConfig.format || d3.format(',.2f');
  const xAxisFormat = graphConfig.xAxisFormat || format;
  const xAxisTickCount =
    graphConfig.xAxisTickCount || width / (xAxisLabelSize * 8);
  const color = graphConfig.color;

  data = data
    .slice()
    .sort((a, b) =>
      a[dataValueKey] < b[dataValueKey]
        ? 1
        : b[dataValueKey] < a[dataValueKey]
          ? -1
          : 0
    );

  const d3n = new D3Node();
  const svg = d3n.createSVG(width, height);

  // Adapted from https://observablehq.com/@d3/horizontal-bar-chart
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d[dataValueKey])])
    .range([margin.left, width - margin.right]);
  // .rangeRound([margin.left, width - margin.right])

  const y = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.1);

  svg
    .attr('viewBox', [0, 0, width, height])
    .attr('font-family', fontFamily)
    .attr('font-size', size);

  // y-axis labels
  svg
    .append('g')
    .attr('text-anchor', 'end')
    .attr('font-weight', 500)
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('alignment-baseline', 'central')
    .attr('x', () => x(0))
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('dx', -labelPadding * 2)
    .text(d => d.name);

  // bars
  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('fill', d => color(d.name))
    .attr('x', x(0))
    .attr('y', (d, i) => y(i))
    .attr('width', d => x(d[dataValueKey]) - x(0))
    .attr('height', y.bandwidth());

  // value labes on top of bars
  svg
    .append('g')
    .attr('fill', 'white')
    .attr('text-anchor', 'end')
    .attr('font-weight', 500)
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('x', d => x(d[dataValueKey]))
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('alignment-baseline', 'central')
    .attr('dx', -labelPadding)
    .text(d => format(d[dataValueKey]))
    .call(text =>
      text
        .filter(d => x(d[dataValueKey]) - x(0) < 40) // short bars
        .attr('dx', labelPadding)
        .attr('fill', 'black')
        .attr('text-anchor', 'start')
    );

  // x axis
  svg.append('g').call(g =>
    g
      .attr('transform', `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(xAxisTickCount, xAxisFormat))
      .call(g => g.select('.domain').remove())
      .attr('font-family', fontFamily)
      .attr('font-size', xAxisLabelSize)
      .attr('opacity', xAxisLabelOpacity)
  );

  // y axis
  // const yAxis = g => g
  //   .attr("transform", `translate(${margin.left},0)`)
  //   .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeOuter(0))
  //     .attr("font-family", fontFamily)
  //     .attr("font-size", size)
  // svg.append("g")
  //     .call(yAxis)

  // return svg.node()
  return d3n.svgString();
}

/**
 *
 * @param {*} data
 * @param {*} graphConfig
 * @return {string}
 */
function createMinMaxBarChart(data, graphConfig) {
  // Adapted from https://observablehq.com/@d3/horizontal-bar-chart
  const size = graphConfig.fontSize || 14;
  const xAxisLabelSize = Math.round(size * 10 * 0.8) / 10;
  const margin = { top: size * 3, right: size, bottom: size * 2, left: size };
  const barHeight = Math.round(size * 2.25);
  const labelPadding = Math.round(barHeight * 0.15);
  const height =
    Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
  const width = graphConfig.width || 600;
  const format = graphConfig.format || d3.format(',.2f');
  const color = graphConfig.color;

  const d3n = new D3Node();
  const svg = d3n.createSVG(width, height);

  svg
    .attr('viewBox', [0, 0, width, height])
    .attr('font-family', fontFamily)
    .attr('font-size', size);

  data = data
    .slice()
    .sort((a, b) => (a.max < b.max ? -1 : b.max < a.max ? 1 : 0));

  const x = d3
    .scaleLog()
    .domain([d3.min(data, d => d.min), d3.max(data, d => d.max)])
    // .range([margin.left, width - margin.right])
    .rangeRound([margin.left, width - margin.right]);

  // console.log(x(1))

  const y = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.1);

  // bars
  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('fill', d => color(d.name))
    .attr('x', d => x(d.min))
    .attr('y', (d, i) => y(i))
    .attr('width', d => x(d.max) - x(d.min))
    .attr('height', y.bandwidth());

  // name label inside bar, center aligned
  svg
    .append('g')
    .attr('fill', 'white')
    .attr('font-weight', 500)
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('x', d => x(d.min) + (x(d.max) - x(d.min)) / 2)
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('alignment-baseline', 'central')
    .text(d => d.name);

  // min value inside bar, left aligned
  svg
    .append('g')
    .attr('fill', 'white')
    .attr('font-weight', 500)
    .attr('text-anchor', 'start')
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('x', d => x(d.min))
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('alignment-baseline', 'central')
    .attr('dx', labelPadding)
    .text(d => format(d.min));

  // max value inside bar, right aligned
  svg
    .append('g')
    .attr('fill', 'white')
    .attr('font-weight', 500)
    .attr('text-anchor', 'end')
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('x', d => x(d.min) + (x(d.max) - x(d.min)))
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('alignment-baseline', 'central')
    .attr('dx', -labelPadding)
    .text(d => format(d.max));

  // x axis
  svg.append('g').call(g =>
    g
      .attr('transform', `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(width / (xAxisLabelSize * 10), format))
      .call(g => g.select('.domain').remove())
      .attr('font-family', fontFamily)
      .attr('font-size', xAxisLabelSize)
      .attr('opacity', xAxisLabelOpacity)
  );

  // const yAxis = g => g
  //   .attr("transform", `translate(${margin.left},0)`)
  //   .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeOuter(0))
  // svg.append("g")
  //     .call(yAxis)

  // return svg.node()
  return d3n.svgString();
}
/**
 * Write svg file
 * @param {string} dir
 * @param {string} filename
 * @param {string} contents
 */
function writefile(dir, filename, contents) {
  if (extname(filename).toLowerCase() === '.svg') {
    contents = optimizeSvg(contents);
  }
  filename = relative(process.cwd(), resolve(dir, filename));

  console.log(`write ${filename}`);
  writeFileSync(filename, contents, 'utf8');
}

/**
 * optimizeSvg
 * @param {string} svgText
 * @return {Promise<string>}
 */
function optimizeSvg(svgText) {
  const { data } = optimize(svgText, { multipass: true });
  return data;
}

main();

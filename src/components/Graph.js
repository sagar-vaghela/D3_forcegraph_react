import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {data} from "./data";

const height = window.innerHeight;
const graphWidth = window.innerWidth;

const Graph = () => {
  const [parentEle, setParentEle] = useState();
  const [canvas, setCanvas] = useState();
  const [context, setContext] = useState();
  const graphDiv = useRef();
  let radius = 5;
  let height = window.innerHeight;
  let graphWidth = window.innerWidth;

  let div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  let simulation = d3
    .forceSimulation()
    .force("center", d3.forceCenter(graphWidth / 2, height / 2))
    .force("x", d3.forceX(graphWidth / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1))
    .force("charge", d3.forceManyBody().strength(-50))
    .force(
      "link",
      d3
        .forceLink()
        .strength(1)
        .id(function (d) {
          return d.id;
        })
    )
    .alphaTarget(0)
    .alphaDecay(0.05);

  let transform = d3.zoomIdentity;

  useEffect(() => {
    if (graphDiv.current) setParentEle(d3.select(graphDiv.current));
  }, [graphDiv]);

  useEffect(() => {
    if (parentEle) {
      const graphCanvas = parentEle
        .select("canvas")
        .attr("width", graphWidth + "px")
        .attr("height", height + "px")
        .node();

      setCanvas(graphCanvas);
      setContext(parentEle.select("canvas").node()?.getContext("2d"));
    }
  }, [parentEle]);

  useEffect(() => {
    if(context) initGraph(data);
  }, [context])
  


  //   console.log("parentEle", parentEle);

  const initGraph = (tempData) => {
    const simulationUpdate = () =>{
        context.save();
  
        context.clearRect(0, 0, graphWidth, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
  
        tempData.edges.forEach((d)  =>{
              context.beginPath();
              context.moveTo(d.source.x, d.source.y);
              context.lineTo(d.target.x, d.target.y);
              context.stroke();
          });
  
          // Draw the nodes
          tempData.nodes.forEach((d, i) => {
  
              context.beginPath();
              context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
              context.fillStyle = d.col ? "red":"black"
              context.fill();
          });
  
          context.restore();
      }

    const dragsubject = (event) => {
        var i,
        x = transform.invertX(event.x),
        y = transform.invertY(event.y),
        dx,
        dy;
        for (i = tempData.nodes.length - 1; i >= 0; --i) {
          let node = tempData.nodes[i];
          dx = x - node.x;
          dy = y - node.y;
    
          if (dx * dx + dy * dy < radius * radius) {
    
            node.x =  transform.applyX(node.x);
            node.y = transform.applyY(node.y);
    
            return node;
          }
        }
      }
    
    
      const dragstarted = (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = transform.invertX(event.x);
        event.subject.fy = transform.invertY(event.y);
      }
    
      const dragged = (event) => {
        event.subject.fx = transform.invertX(event.x);
        event.subject.fy = transform.invertY(event.y);
      }
    
      const dragended = (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }



    const zoomed = (event) => {
      console.log("zooming")
      transform = event.transform;
      simulationUpdate();
    }

    d3.select(canvas)
        .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end",dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))





    simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);

  }

  return (
    <div ref={graphDiv} id="graphDiv">
      <canvas></canvas>
    </div>
  );
};

export default Graph;

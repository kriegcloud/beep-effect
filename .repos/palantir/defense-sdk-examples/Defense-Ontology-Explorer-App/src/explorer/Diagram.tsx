/*
 * (c) Copyright 2024 Palantir Technologies Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useRef, useState } from "react";
import styles from "./Diagram.module.scss";
import { DomainCategory } from "../features/osdk/types";

interface DiagramProps {
  onDomainClick: (domain: DomainCategory) => void;
  selectedDomain: DomainCategory | null;
}

const Diagram: React.FC<DiagramProps> = ({ onDomainClick, selectedDomain }) => {
  const [dimensions, setDimensions] = useState({
    scale: 0.7,
    svgWidth: 770,
    svgHeight: 560,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDomain, setHoveredDomain] = useState<DomainCategory | null>(
    null
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const baseWidth = 1100;
        const baseHeight = 800;
        const widthScale = containerWidth / baseWidth;
        const heightScale = containerHeight / baseHeight;
        const newScale = Math.min(widthScale, heightScale, 1);
        const newSvgHeight = Math.min(baseHeight * newScale, containerHeight);

        setDimensions({
          scale: newScale * 0.95,
          svgWidth: baseWidth * newScale,
          svgHeight: newSvgHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { scale, svgWidth, svgHeight } = dimensions;

  const outerRadius = 310 * scale;
  const circleCenter = {
    x: (svgWidth / 2) * 0.55,
    y: (svgHeight / 2) * 0.58,
  };
  const smallCircleRadius = 5 * scale;
  const rectWidth = 220 * scale;
  const rectHeight = 65 * scale;
  const rectCornerRadius = 5 * scale;
  const generalOffset = 10 * scale;
  const protectionOffset = 10 * scale;

  const points = [
    { label: DomainCategory.protection, angle: -Math.PI / 2 },
    {
      label: DomainCategory.sustainment,
      angle: -Math.PI / 2 + (2 * Math.PI) / 5,
    },
    {
      label: DomainCategory.intelligence,
      angle: -Math.PI / 2 + (4 * Math.PI) / 5,
    },
    {
      label: DomainCategory.missionPlanning,
      angle: -Math.PI / 2 + (6 * Math.PI) / 5,
    },
    {
      label: DomainCategory.targetingFires,
      angle: -Math.PI / 2 + (8 * Math.PI) / 5,
    },
  ];

  const pointCoordinates = points.map((point) => ({
    ...point,
    x: circleCenter.x + outerRadius * Math.cos(point.angle),
    y: circleCenter.y + outerRadius * Math.sin(point.angle),
  }));

  const middleCircleRadius = 180 * 0.67 * scale;
  const innermostCircleRadius = middleCircleRadius * 0.5;
  const friendlyTextRadius =
    (middleCircleRadius + innermostCircleRadius) / 2 - 10 * scale;
  const enemyTextRadius = (middleCircleRadius + innermostCircleRadius) / 2;
  const starInnerRadius = middleCircleRadius + 30 * scale;
  const innerDottedCircleRadius = outerRadius * 0.98;

  const starPoints = [];
  for (let i = 0; i < 5; i++) {
    const outerPointAngle = points[i].angle;
    const innerPointAngle = outerPointAngle + Math.PI / 5;
    starPoints.push({
      x: circleCenter.x + innerDottedCircleRadius * Math.cos(outerPointAngle),
      y: circleCenter.y + innerDottedCircleRadius * Math.sin(outerPointAngle),
    });
    starPoints.push({
      x: circleCenter.x + starInnerRadius * Math.cos(innerPointAngle),
      y: circleCenter.y + starInnerRadius * Math.sin(innerPointAngle),
    });
  }

  const inversePentagonPoints = points.map((point) => ({
    x:
      circleCenter.x +
      innerDottedCircleRadius * Math.cos(point.angle + Math.PI / 5),
    y:
      circleCenter.y +
      innerDottedCircleRadius * Math.sin(point.angle + Math.PI / 5),
  }));

  const handleClick = (domainCategory: DomainCategory) => {
    onDomainClick(domainCategory);
  };

  const handleMouseEnter = (domain: DomainCategory) => {
    setHoveredDomain(domain);
  };

  const handleMouseLeave = () => {
    setHoveredDomain(null);
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${-svgWidth * 0.2} ${-svgHeight * 0.2} ${svgWidth * 0.95} ${
        svgHeight * 0.95
      }`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="hover-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.2" />
          <feMorphology
            operator="dilate"
            radius="1"
            in="SourceAlpha"
            result="expanded"
          />
          <feFlood floodColor="rgba(17, 20, 24, 0.2)" result="color" />
          <feComposite
            in="color"
            in2="expanded"
            operator="in"
            result="shadow"
          />
          <feComposite in="shadow" in2="SourceGraphic" operator="over" />
        </filter>
        <path
          id="friendlyPath"
          d={`M ${circleCenter.x - friendlyTextRadius}, ${
            circleCenter.y
          } A ${friendlyTextRadius} ${friendlyTextRadius} 0 0 1 ${
            circleCenter.x + friendlyTextRadius
          }, ${circleCenter.y}`}
          fill="none"
        />
        <path
          id="enemyPath"
          d={`M ${circleCenter.x - enemyTextRadius}, ${
            circleCenter.y
          } A ${enemyTextRadius} ${enemyTextRadius} 0 0 0 ${
            circleCenter.x + enemyTextRadius
          }, ${circleCenter.y}`}
          fill="none"
        />
      </defs>
      <circle
        cx={circleCenter.x}
        cy={circleCenter.y}
        r={outerRadius}
        className={styles.outerCircle}
      />
      <circle
        cx={circleCenter.x}
        cy={circleCenter.y}
        r={middleCircleRadius}
        className={styles.middleCircle}
      />
      <circle
        cx={circleCenter.x}
        cy={circleCenter.y}
        r={innermostCircleRadius}
        className={`${styles.innermostCircle} ${styles.clickable} ${
          selectedDomain === DomainCategory.orderOfBattle ? styles.selected : ""
        } ${
          hoveredDomain === DomainCategory.orderOfBattle ? styles.hovered : ""
        }`}
        onClick={() => handleClick(DomainCategory.orderOfBattle)}
        onMouseEnter={() => handleMouseEnter(DomainCategory.orderOfBattle)}
        onMouseLeave={handleMouseLeave}
      />
      <circle
        cx={circleCenter.x}
        cy={circleCenter.y}
        r={innerDottedCircleRadius}
        className={styles.innerDottedCircle}
      />
      <line
        x1={circleCenter.x - innermostCircleRadius}
        y1={circleCenter.y}
        x2={circleCenter.x - middleCircleRadius}
        y2={circleCenter.y}
        className={styles.line}
      />
      <line
        x1={circleCenter.x + innermostCircleRadius}
        y1={circleCenter.y}
        x2={circleCenter.x + middleCircleRadius}
        y2={circleCenter.y}
        className={styles.line}
      />
      <text
        x={circleCenter.x}
        y={circleCenter.y - 12 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`${styles.text} ${styles.clickable} ${
          selectedDomain === DomainCategory.orderOfBattle ? styles.selected : ""
        } ${
          hoveredDomain === DomainCategory.orderOfBattle ? styles.hovered : ""
        }`}
        onClick={() => handleClick(DomainCategory.orderOfBattle)}
        onMouseEnter={() => handleMouseEnter(DomainCategory.orderOfBattle)}
        onMouseLeave={handleMouseLeave}
      >
        Order
      </text>
      <text
        x={circleCenter.x}
        y={circleCenter.y + 12 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`${styles.text} ${styles.clickable} ${
          selectedDomain === DomainCategory.orderOfBattle ? styles.selected : ""
        } ${
          hoveredDomain === DomainCategory.orderOfBattle ? styles.hovered : ""
        }`}
        onClick={() => handleClick(DomainCategory.orderOfBattle)}
        onMouseEnter={() => handleMouseEnter(DomainCategory.orderOfBattle)}
        onMouseLeave={handleMouseLeave}
      >
        of Battle
      </text>
      {pointCoordinates.map((point, index) => (
        <React.Fragment key={index}>
          <line
            x1={
              circleCenter.x +
              innerDottedCircleRadius * Math.cos(points[index].angle)
            }
            y1={
              circleCenter.y +
              innerDottedCircleRadius * Math.sin(points[index].angle)
            }
            x2={
              circleCenter.x +
              innerDottedCircleRadius *
                Math.cos(points[(index + 1) % points.length].angle)
            }
            y2={
              circleCenter.y +
              innerDottedCircleRadius *
                Math.sin(points[(index + 1) % points.length].angle)
            }
            className={styles.dottedLine}
          />
          <line
            x1={
              circleCenter.x +
              innerDottedCircleRadius * Math.cos(points[index].angle)
            }
            y1={
              circleCenter.y +
              innerDottedCircleRadius * Math.sin(points[index].angle)
            }
            x2={
              circleCenter.x +
              middleCircleRadius * Math.cos(points[index].angle)
            }
            y2={
              circleCenter.y +
              middleCircleRadius * Math.sin(points[index].angle)
            }
            className={styles.line}
          />
          <g
            className={`${styles.clickable} ${
              selectedDomain === point.label ? styles.selected : ""
            } ${hoveredDomain === point.label ? styles.hovered : ""}`}
            onClick={() => handleClick(point.label)}
            onMouseEnter={() => handleMouseEnter(point.label)}
            onMouseLeave={handleMouseLeave}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={smallCircleRadius}
              className={styles.smallCircle}
            />
            <rect
              x={
                index === 0
                  ? point.x - rectWidth / 2
                  : index === 1
                  ? point.x + generalOffset
                  : index === 2
                  ? point.x + generalOffset
                  : index === 3
                  ? point.x - rectWidth - generalOffset
                  : point.x - rectWidth - generalOffset
              }
              y={
                index === 0
                  ? point.y - rectHeight - protectionOffset
                  : index === 1
                  ? point.y - rectHeight / 2 - generalOffset
                  : index === 2
                  ? point.y + generalOffset
                  : index === 3
                  ? point.y + generalOffset
                  : point.y - rectHeight / 2 - generalOffset
              }
              width={rectWidth}
              height={rectHeight}
              rx={rectCornerRadius}
              ry={rectCornerRadius}
              className={`${styles.rectangle} ${
                selectedDomain === point.label ? styles.selected : ""
              }`}
            />
            <text
              x={
                index === 0
                  ? point.x
                  : index === 1
                  ? point.x + rectWidth / 2 + generalOffset
                  : index === 2
                  ? point.x + rectWidth / 2 + generalOffset
                  : index === 3
                  ? point.x - rectWidth / 2 - generalOffset
                  : point.x - rectWidth / 2 - generalOffset
              }
              y={
                index === 0
                  ? point.y - rectHeight / 2 - protectionOffset
                  : index === 1
                  ? point.y - generalOffset
                  : index === 2
                  ? point.y + rectHeight / 2 + generalOffset
                  : index === 3
                  ? point.y + rectHeight / 2 + generalOffset
                  : point.y - generalOffset
              }
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.text}
            >
              {point.label.replace("_", " ")}
            </text>
          </g>
        </React.Fragment>
      ))}
      <polygon
        points={starPoints.map((point) => `${point.x},${point.y}`).join(" ")}
        className={styles.star}
      />
      {inversePentagonPoints.map((point, index) => (
        <line
          key={`inverse-${index}`}
          x1={point.x}
          y1={point.y}
          x2={
            inversePentagonPoints[(index + 1) % inversePentagonPoints.length].x
          }
          y2={
            inversePentagonPoints[(index + 1) % inversePentagonPoints.length].y
          }
          className={styles.dottedLine}
        />
      ))}
      <text className={styles.displayText}>
        <textPath href="#friendlyPath" startOffset="50%" textAnchor="middle">
          Friendly
        </textPath>
      </text>
      <text className={styles.displayText}>
        <textPath href="#enemyPath" startOffset="50%" textAnchor="middle">
          Enemy
        </textPath>
      </text>
    </svg>
  );
};

export default Diagram;

"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { DIMENSION_META, type EvaluationResult } from "@/lib/types";

export default function ScoreRadar({ result }: { result: EvaluationResult }) {
  const data = result.dimensions.map((d) => ({
    dimension: DIMENSION_META[d.key].label,
    score: d.score,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(148,163,184,0.18)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Radar
            name="评分"
            dataKey="score"
            stroke="#34d399"
            fill="#34d399"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

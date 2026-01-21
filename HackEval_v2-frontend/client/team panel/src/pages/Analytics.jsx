import React, { useContext, useEffect, useState } from "react";
import { TeamContext } from "../context/TeamContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "../config";

const Analytics = () => {
  const { team } = useContext(TeamContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!team?.teamId) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/teams/${team.teamId}/analytics`,
        );
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [team?.teamId]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading || !analyticsData) {
    return (
      <div className="analytics-container">
        <h1>Team Analytics</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <h1>Team Analytics</h1>

      <div className="analytics-grid">
        <div className="chart-card">
          <h2>Activity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.activityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.activityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Project Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analyticsData.progressData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#8884d8" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={analyticsData.performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                name="Performance Score"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric">
              <h3>Team Velocity</h3>
              <p>{analyticsData.keyMetrics.commitCount} commits</p>
            </div>
            <div className="metric">
              <h3>Code Quality</h3>
              <p>A+ ({analyticsData.keyMetrics.score}%)</p>
            </div>
            <div className="metric">
              <h3>Tests Coverage</h3>
              <p>{analyticsData.keyMetrics.testsWritten} tests</p>
            </div>
            <div className="metric">
              <h3>Bug Resolution</h3>
              <p>{analyticsData.keyMetrics.bugsFixed} fixed</p>
            </div>
          </div>
        </div>

        <div className="insights-card">
          <h2>Key Insights</h2>
          <ul>
            {analyticsData.keyInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

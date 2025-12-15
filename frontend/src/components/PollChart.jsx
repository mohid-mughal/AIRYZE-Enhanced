import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Beautiful light color palette for charts
const CHART_COLORS = [
  "#93c5fd", // blue-300
  "#c4b5fd", // violet-300
  "#f9a8d4", // pink-300
  "#fcd34d", // amber-300
  "#6ee7b7", // emerald-300
  "#a5b4fc", // indigo-300
  "#fdba74", // orange-300
  "#5eead4", // teal-300
  "#f0abfc", // fuchsia-300
  "#bef264", // lime-300
];

export default function PollChart({ poll }) {
  // Calculate total votes
  const totalVotes = poll.votes
    ? Object.values(poll.votes).reduce((sum, count) => sum + count, 0)
    : 0;

  // Prepare chart data
  const chartData = {
    labels: poll.options,
    datasets: [
      {
        data: poll.options.map((option) => poll.votes[option] || 0),
        backgroundColor: CHART_COLORS.slice(0, poll.options.length),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
        hoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: "600",
            family: "'Inter', 'system-ui', sans-serif",
          },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = totalVotes > 0 
                  ? ((value / totalVotes) * 100).toFixed(1) 
                  : 0;
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#d1d5db",
        borderWidth: 2,
        padding: 14,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
        titleFont: {
          size: 13,
          weight: "700",
        },
        bodyFont: {
          size: 12,
          weight: "500",
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const percentage = totalVotes > 0 
              ? ((value / totalVotes) * 100).toFixed(1) 
              : 0;
            return `${context.label}: ${value} votes (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Results</h4>
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>
      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg p-4 border border-blue-100">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

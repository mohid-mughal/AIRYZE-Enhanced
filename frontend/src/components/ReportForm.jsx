import { useState, useEffect } from "react";
import { createReport } from "../api/userReportsService";

export default function ReportForm({ user, selectedLocation, onReportSubmitted }) {
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update location when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!user) {
      setMessage({ type: "error", text: "Please log in to submit a report" });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: "error", text: "Description is required" });
      return;
    }

    if (!location.lat || !location.lon) {
      setMessage({ type: "error", text: "Please select a location on the map" });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });

      const reportData = {
        description: description.trim(),
        photo_url: photoUrl.trim() || null,
        lat: location.lat,
        lon: location.lon,
      };

      const newReport = await createReport(reportData);
      
      // Show success message
      setMessage({ type: "success", text: "Report submitted successfully!" });
      
      // Clear form
      setDescription("");
      setPhotoUrl("");
      setLocation({ lat: null, lon: null });
      
      // Notify parent component
      if (onReportSubmitted) {
        onReportSubmitted(newReport);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to submit report. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the air quality conditions you're observing..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Photo URL */}
      <div>
        <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Photo URL (optional)
        </label>
        <input
          id="photoUrl"
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>

      {/* Location Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Location *
        </label>
        {location.lat && location.lon ? (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-gray-700">Lat:</span>
              <span className="font-mono text-gray-800">{location.lat.toFixed(6)}</span>
              <span className="font-semibold text-gray-700">Lon:</span>
              <span className="font-mono text-gray-800">{location.lon.toFixed(6)}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
            Click on the map to select a location
          </div>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !user}
        className={`w-full px-6 py-3 text-white font-medium rounded-lg transition-all ${
          isSubmitting || !user
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        }`}
      >
        {isSubmitting ? "Submitting..." : user ? "Submit Report" : "Login to Submit"}
      </button>
    </form>
  );
}

// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { ExternalLink, ArrowLeft, MapPin, Calendar, Code, User, Star, Sparkles, Heart, Loader as LoaderIcon, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";

const csSkills = [
  "React","JavaScript","HTML","CSS","Node.js","Python","Java","C++","C#",
  "TypeScript","Angular","Vue.js","PHP","Ruby","Go","Rust","Swift","Kotlin",
  "Solidity","Blockchain","Machine Learning","Data Science","DevOps","AWS","Docker","Kubernetes"
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Scientist",
  "AI/ML Engineer",
  "Blockchain Developer",
  "DevOps Engineer",
  "Mobile App Developer",
  "UI/UX Designer",
  "Software Engineer",
  "Cloud Engineer",
  "Cybersecurity Specialist",
  "Game Developer",
  "Embedded Systems Engineer",
  "Other"
];

// Team members data
const teamMembers = [
  { name: "Priyaranjan", linkedin: "https://www.linkedin.com/in/priyaranjan-d-a-b436002a2?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Ram", linkedin: "https://www.linkedin.com/in/rampratheeshsk?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Praveen", linkedin: "https://www.linkedin.com/in/praveen-somasundaram2005?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Pranaav", linkedin: "https://www.linkedin.com/in/pranaav-kumar?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }
];

// Loader Component using Lucide Loader
const Loader = () => (
  <div className="flex flex-col items-center justify-center py-10" aria-label="Loading...">
    <LoaderIcon className="animate-spin text-[#A259FF]" size={48} strokeWidth={3} />
    <span className="mt-4 text-[#B3B3B3] text-base font-medium">Loading...</span>
  </div>
);

export default function Dashboard() {
  const [usersData, setUsersData] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const [loading, setLoading] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInEmail = sessionStorage.getItem("email");

  // Utility function to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token") || sessionStorage.getItem("authToken");
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  // Check if token is expired (basic check)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Utility function to check if user is authenticated
  const validateToken = () => {
    const token = sessionStorage.getItem("token") || sessionStorage.getItem("authToken");
    
    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return false;
    }

    if (isTokenExpired(token)) {
      sessionStorage.clear();
      alert("Session expired. Please login again.");
      navigate("/login");
      return false;
    }

    return true;
  };

  // Fetch all posted profiles for feed
  const fetchPostedProfiles = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}/profile/posted/all`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const filteredProfiles = data.profiles?.filter(
          (user) => user.collegeMail !== loggedInEmail
        ) || [];
        setUsersData(filteredProfiles);
      } else {
        if (response.status === 401) {
          sessionStorage.clear();
          alert("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        setUsersData([]);
      }
    } catch (err) {
      setUsersData([]);
    }
    setLoading(false);
  };

  // Fetch my profile data
  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}/profile/me`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMyProfile(data);
        if (data._id && !sessionStorage.getItem("userId")) {
          sessionStorage.setItem("userId", data._id);
        }
      } else {
        if (response.status === 401) {
          sessionStorage.clear();
          alert("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        setMyProfile(null);
      }
    } catch (err) {
      setMyProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (validateToken()) {
      fetchPostedProfiles();
      fetchMyProfile();
    }
    // eslint-disable-next-line
  }, [loggedInEmail]);

  // Filtered feed
  const filteredUsers = usersData.filter((user) => {
    const matchesUsername = user.name
      ?.toLowerCase()
      .includes(searchUsername.toLowerCase());
    const matchesSkill = searchSkill
      ? user.techStacks?.some((s) =>
          s.toLowerCase().includes(searchSkill.toLowerCase())
        )
      : true;
    const matchesRole = searchRole
      ? user.roles?.some((r) => r.toLowerCase().includes(searchRole.toLowerCase()))
      : true;

    return matchesUsername && matchesSkill && matchesRole;
  });

  // Handlers
  const handleViewProfile = (userId, username) => {
    const selectedUser = usersData.find(user => user._id === userId);
    if (selectedUser) {
      setSelectedUserProfile(selectedUser);
      setActiveTab("userProfile");
    }
  };

  const handleBackToFeed = () => {
    setSelectedUserProfile(null);
    setActiveTab("feed");
  };

  const handlePostProfile = async () => {
    if (!myProfile?._id) {
      alert("Profile not found!");
      return;
    }

    if (!validateToken()) return;

    try {
      const response = await fetch(`${API_URL}/profile/${myProfile._id}/post`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setMyProfile(updatedProfile);
        fetchPostedProfiles();
        alert("Profile posted successfully!");
      } else {
        if (response.status === 401) {
          sessionStorage.clear();
          alert("Session expired. Please log in again.");
          navigate("/login");
        } else {
          alert("Failed to post profile");
        }
      }
    } catch (error) {
      alert("Error posting profile");
    }
  };

  const handleEditProfile = () => navigate("/ProfileSetUp");

  const handleDeleteProfile = async () => {
    if (!myProfile?._id) {
      alert("Profile not found!");
      return;
    }

    if (!validateToken()) return;

    try {
      const response = await fetch(`${API_URL}/profile/${myProfile._id}/unpost`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setMyProfile(updatedProfile);
        fetchPostedProfiles();
        alert("Profile removed from public feed!");
      } else {
        if (response.status === 401) {
          sessionStorage.clear();
          alert("Session expired. Please log in again.");
          navigate("/login");
        } else {
          alert("Failed to remove profile from feed");
        }
      }
    } catch (error) {
      alert("Error removing profile");
    }
  };

  const handleTeamMemberClick = (linkedinUrl) => {
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };
  // Enhanced Profile Card Component
  const ProfileCard = ({ user, index }) => {
    return (
      <div
        className="group bg-[#1A1A1A] border border-[#333] rounded-xl p-6 hover:border-[#A259FF]/50 hover:bg-[#1F1F1F] transition-all duration-300"
      >
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#A259FF] to-[#8B3EF2] flex items-center justify-center text-lg font-bold text-white shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-white cursor-pointer hover:text-[#A259FF] transition-colors flex items-center gap-2 truncate"
                onClick={() => handleViewProfile(user._id, user.name)}
              >
                {user.name}
                <ExternalLink size={14} className="shrink-0" />
              </h3>
            </div>
            <p className="text-[#888] text-sm mt-1">
              {user.year || "Year not specified"}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-4">
          <p className="text-[#B3B3B3] text-sm leading-relaxed line-clamp-2">
            {user.bio || "Passionate developer ready to collaborate on exciting projects!"}
          </p>
        </div>

        {/* Roles Section */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-[#888] mb-2 flex items-center gap-1">
            <User size={12} className="text-[#A259FF]" />
            Roles
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {user.roles?.slice(0, 2).map((role, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs font-medium rounded-md bg-[#A259FF]/10 text-[#A259FF] border border-[#A259FF]/20"
              >
                {role}
              </span>
            ))}
            {user.roles?.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-[#333] text-[#888]">
                +{user.roles.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-[#888] mb-2 flex items-center gap-1">
            <Code size={12} className="text-[#A259FF]" />
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {user.techStacks?.slice(0, 5).map((stack, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs font-medium rounded-md bg-[#0D0D0D] text-[#A259FF] border border-[#333] hover:border-[#A259FF]/50 transition-colors"
              >
                {stack}
              </span>
            ))}
            {user.techStacks?.length > 5 && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-[#333] text-[#888]">
                +{user.techStacks.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleViewProfile(user._id, user.name)}
            className="px-4 py-2 bg-[#A259FF] hover:bg-[#8B3EF2] text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            View Profile
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0D0D0D] text-white">
      {/* Add keyframe animations */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Team Branding Header with TeamX Dropdown */}
      <div className="w-full bg-[#1A1A1A] border-b border-[#333] py-3">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-[#B3B3B3] hover:text-[#A259FF] transition-colors cursor-pointer"
              >
                Designed and Crafted by TeamX
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isTeamDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Dropdown Menu */}
              {isTeamDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-[#2A2A2A] border border-[#333] rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {teamMembers.map((member, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleTeamMemberClick(member.linkedin);
                          setIsTeamDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#B3B3B3] hover:text-[#A259FF] hover:bg-[#333] transition-colors flex items-center justify-between"
                      >
                        {member.name}
                        <ExternalLink size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isTeamDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsTeamDropdownOpen(false)}
        />
      )}

      {/* Tabs - Hide when viewing user profile */}
      {activeTab !== "userProfile" && (
        <div className="flex gap-2 mb-8 p-1 rounded-lg mt-6 mx-auto max-w-2xl w-full bg-[#1A1A1A]">
          <button
            className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all ${
              activeTab === "feed"
                ? "bg-[#A259FF] text-white"
                : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("feed")}
          >
            Feed
          </button>
          <button
            className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-[#A259FF] text-white"
                : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Post Yourself
          </button>
        </div>
      )}

      <div className="flex justify-center items-start px-4 flex-1 w-full">
        <div className="w-full max-w-5xl">
          {/* Loader for feed/my-profile fetch */}
          {loading && <Loader />}

          {/* FEED TAB */}
          {!loading && activeTab === "feed" && (
            <div>
              {/* Search filters */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 p-6 rounded-xl bg-[#1A1A1A]">
                {/* Username filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">
                    Search by Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:border-[#A259FF] focus:ring-1 focus:ring-[#A259FF] transition-all duration-300"
                  />
                </div>

                {/* Skill filter with datalist */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">
                    Filter by Skill
                  </label>
                  <input
                    list="skills-list"
                    type="text"
                    placeholder="Enter or select a skill..."
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:border-[#A259FF] focus:ring-1 focus:ring-[#A259FF] transition-all duration-300"
                  />
                  <datalist id="skills-list">
                    {csSkills.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                {/* Role filter with datalist */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">
                    Filter by Role
                  </label>
                  <input
                    list="roles-list"
                    type="text"
                    placeholder="Enter or select a role..."
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:border-[#A259FF] focus:ring-1 focus:ring-[#A259FF] transition-all duration-300"
                  />
                  <datalist id="roles-list">
                    {roles.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Feed cards */}
              <div className="space-y-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#A259FF]/20 to-[#8B3EF2]/20 flex items-center justify-center">
                      <User size={32} className="text-[#A259FF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#B3B3B3] mb-2">No profiles found</h3>
                    <p className="text-[#888]">Try adjusting your search criteria to discover more developers.</p>
                  </div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <ProfileCard key={user._id} user={user} index={index} />
                  ))
                )}
              </div>
            </div>
          )}

         {/* MY PROFILE TAB */}
{!loading && activeTab === "profile" && (
  <div>
    {myProfile ? (
      <div className="p-4 sm:p-6 rounded-xl border border-[#333] bg-[#1A1A1A] space-y-4 max-w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold break-words">{myProfile.name}</h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                myProfile.isPosted
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {myProfile.isPosted ? "Posted" : "Not Posted"}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[#B3B3B3] break-words">{myProfile.bio}</p>

        {/* Details */}
        <p className="text-sm text-[#888] break-words">
          Year: {myProfile.year || "Not specified"}
        </p>
        <p className="text-sm text-[#888] break-words">
          Email: {myProfile.collegeMail}
        </p>
        <p className="text-sm text-[#888] break-words">
          Roles: {myProfile.roles?.join(", ") || "Not specified"}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {myProfile.techStacks?.map((s, index) => (
            <span
              key={`${s}-${index}`}
              className="px-3 py-1 text-xs rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333] break-words"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Links */}
        {(myProfile.linkedin || myProfile.github) && (
          <div className="space-y-2 max-w-full">
            <h3 className="text-sm font-medium text-[#B3B3B3]">Links:</h3>

            {myProfile.linkedin && (
              <p className="text-sm text-[#888] break-words">
                LinkedIn:{" "}
                <a
                  href={myProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A259FF] hover:underline break-all max-w-full block"
                >
                  {myProfile.linkedin}
                </a>
              </p>
            )}

            {myProfile.github && (
              <p className="text-sm text-[#888] break-words">
                GitHub:{" "}
                <a
                  href={myProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A259FF] hover:underline break-all max-w-full block"
                >
                  {myProfile.github}
                </a>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              myProfile.isPosted
                ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
                : "bg-[#A259FF] hover:bg-[#8B3EF2]"
            }`}
            onClick={handlePostProfile}
            disabled={myProfile.isPosted}
          >
            {myProfile.isPosted ? "Already Posted" : "Post My Profile"}
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333] text-white transition-colors"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              myProfile.isPosted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
            }`}
            onClick={handleDeleteProfile}
            disabled={!myProfile.isPosted}
          >
            {myProfile.isPosted ? "Remove from Feed" : "Not Posted"}
          </button>
        </div>
      </div>
    ) : (
      /* No Profile Found State */
      <div className="p-6 rounded-xl border border-[#333] bg-[#1A1A1A] text-center max-w-full overflow-hidden">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#A259FF]/20 to-[#8B3EF2]/20 flex items-center justify-center">
          <User size={32} className="text-[#A259FF]" />
        </div>
        <h3 className="text-xl font-semibold text-[#B3B3B3] mb-2">
          Profile not found
        </h3>
        <p className="text-[#888] mb-4">
          Unable to load your profile. Please try refreshing the page or check
          your connection.
        </p>
        <button
          onClick={fetchMyProfile}
          className="px-4 py-2 bg-[#A259FF] hover:bg-[#8B3EF2] text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )}
  </div>
)}

          {/* USER PROFILE VIEW */}
          {!loading && activeTab === "userProfile" && selectedUserProfile && (
            <div className="flex items-center justify-center">
              <div className="w-full max-w-3xl bg-[#141414] p-10 rounded-2xl shadow-2xl border border-gray-800">
                {/* Back Button */}
                <button
                  onClick={handleBackToFeed}
                  className="flex items-center gap-2 text-[#A259FF] hover:text-purple-400 mb-6 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Feed
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#A259FF] to-purple-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {selectedUserProfile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold text-purple-400">
                    {selectedUserProfile.name || "Unknown User"}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {selectedUserProfile.year || "Year not specified"} • {selectedUserProfile.roles?.[0] || "Role not specified"}
                  </p>
                </div>

                {/* Profile Details */}
                <div className="space-y-8">
                  {/* Email */}
                  <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                    <h2 className="text-sm font-medium text-gray-400">College Email</h2>
                    <p className="text-white mt-1">{selectedUserProfile.collegeMail || "Email not provided"}</p>
                  </div>

                  {/* Tech Stack */}
                  <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                    <h2 className="text-sm font-medium text-gray-400">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedUserProfile.techStacks && selectedUserProfile.techStacks.length > 0 ? (
                        selectedUserProfile.techStacks.map((stack, index) => (
                          <span
                            key={`${stack}-${index}`}
                            className="px-3 py-1 text-sm rounded-full bg-[#0D0D0D] text-[#A259FF] border border-gray-700"
                          >
                            {stack}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No tech stack specified</span>
                      )}
                    </div>
                  </div>

                  {/* Roles */}
                  {selectedUserProfile.roles && selectedUserProfile.roles.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                      <h2 className="text-sm font-medium text-gray-400">Roles</h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedUserProfile.roles.map((role, index) => (
                          <span
                            key={`${role}-${index}`}
                            className="px-3 py-1 text-sm rounded-full bg-[#0D0D0D] text-purple-300 border border-gray-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                      <h2 className="text-sm font-medium text-gray-400">LinkedIn</h2>
                      {selectedUserProfile.linkedin ? (
                        <a
                          href={selectedUserProfile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline break-all mt-1 block transition-colors"
                        >
                          {selectedUserProfile.linkedin}
                        </a>
                      ) : (
                        <span className="text-gray-500 mt-1 block">Not provided</span>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                      <h2 className="text-sm font-medium text-gray-400">GitHub</h2>
                      {selectedUserProfile.github ? (
                        <a
                          href={selectedUserProfile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline break-all mt-1 block transition-colors"
                        >
                          {selectedUserProfile.github}
                        </a>
                      ) : (
                        <span className="text-gray-500 mt-1 block">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-4 rounded-xl bg-[#1C1C1C] border border-gray-700 hover:border-purple-500 transition">
                    <h2 className="text-sm font-medium text-gray-400">Bio</h2>
                    <p className="text-gray-300 mt-2">
                      {selectedUserProfile.bio || "No bio provided."}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleBackToFeed}
                      className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#333] text-white rounded-lg font-semibold transition-colors"
                    >
                      Back to Feed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GroupFeed } from "./GroupFeed";

interface GroupsHubProps {
  setCurrentPage: (page: string) => void;
}

export function GroupsHub({ setCurrentPage }: GroupsHubProps) {
  const groups = useQuery(api.groups.getAllGroups);
  const userGroups = useQuery(api.groups.getUserGroups);
  const joinGroup = useMutation(api.groups.joinGroup);
  const [selectedGroup, setSelectedGroup] = useState<Id<"groups"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGroup = async (groupId: Id<"groups">) => {
    setIsLoading(true);
    try {
      await joinGroup({ groupId });
    } catch (error) {
      console.error("Failed to join group:", error);
    }
    setIsLoading(false);
  };

  // Seasonal color themes
  const getGroupTheme = (seasonalType: string) => {
    switch (seasonalType) {
      case "Winter":
        return {
          gradient: "from-blue-600 to-indigo-700",
          lightGradient: "from-blue-50 to-indigo-100",
          borderColor: "border-blue-300",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
        };
      case "Spring":
        return {
          gradient: "from-orange-500 to-pink-500",
          lightGradient: "from-orange-50 to-pink-100",
          borderColor: "border-orange-300",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
        };
      case "Summer":
        return {
          gradient: "from-pink-500 to-purple-500",
          lightGradient: "from-pink-50 to-purple-100",
          borderColor: "border-pink-300",
          textColor: "text-pink-700",
          bgColor: "bg-pink-50",
        };
      case "Autumn":
        return {
          gradient: "from-amber-600 to-orange-600",
          lightGradient: "from-amber-50 to-orange-100",
          borderColor: "border-amber-300",
          textColor: "text-amber-700",
          bgColor: "bg-amber-50",
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-700",
          lightGradient: "from-gray-50 to-gray-100",
          borderColor: "border-gray-300",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
        };
    }
  };

  if (!groups) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seasonal Color Groups</h1>
        <p className="text-gray-600">
          Connect with others who share your seasonal color palette! Join your group to share style tips,
          product finds, and outfit inspiration.
        </p>
      </div>

      {/* Your Groups Section */}
      {userGroups && userGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userGroups.map((group) => {
              const theme = getGroupTheme(group.seasonalType);
              return (
                <div
                  key={group._id}
                  className={`bg-gradient-to-br ${theme.lightGradient} border ${theme.borderColor} rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  onClick={() => setSelectedGroup(group._id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {group.seasonalType === "Winter" && "❄️"}
                      {group.seasonalType === "Spring" && "🌸"}
                      {group.seasonalType === "Summer" && "☀️"}
                      {group.seasonalType === "Autumn" && "🍂"}
                    </span>
                    <span className={`text-xs ${theme.textColor} font-semibold`}>
                      MEMBER
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.memberCount} members
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Groups Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {userGroups && userGroups.length > 0 ? "Explore Other Groups" : "Join Your Seasonal Group"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const theme = getGroupTheme(group.seasonalType);
            const isMember = group.isMember;
            
            return (
              <div
                key={group._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
              >
                {/* Group Header with Gradient */}
                <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">
                      {group.seasonalType === "Winter" && "❄️"}
                      {group.seasonalType === "Spring" && "🌸"}
                      {group.seasonalType === "Summer" && "☀️"}
                      {group.seasonalType === "Autumn" && "🍂"}
                    </span>
                    {isMember && (
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                        MEMBER
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{group.name}</h3>
                  <p className="text-sm opacity-90">
                    {group.seasonalType} Color Palette
                  </p>
                </div>

                {/* Group Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {group.memberCount} members
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Active community
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isMember ? (
                    <button
                      onClick={() => setSelectedGroup(group._id)}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${theme.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                      View Group
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group._id)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${theme.lightGradient} ${theme.textColor} border ${theme.borderColor} rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50`}
                    >
                      {isLoading ? "Joining..." : "Join Group"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Feed Modal */}
      {selectedGroup && (
        <GroupFeed 
          groupId={selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
        />
      )}
    </div>
  );
}
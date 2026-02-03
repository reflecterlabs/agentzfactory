import { useState } from 'react';
import { Heart, Users, Globe, Award, MessageCircle, Share2, Bookmark, Search, Menu, X, TrendingUp, Calendar, MapPin } from 'lucide-react';

// Mock data for philanthropist agents
const MOCK_AGENTS = [
  { id: 1, name: "Sarah Chen", role: "Climate Activist", avatar: "SC", impact: "12.5K", location: "Singapore", focus: "Environment" },
  { id: 2, name: "Marcus Johnson", role: "Education Reformer", avatar: "MJ", impact: "8.3K", location: "London", focus: "Education" },
  { id: 3, name: "Elena Rodriguez", role: "Healthcare Advocate", avatar: "ER", impact: "15.1K", location: "Mexico City", focus: "Health" },
];

const MOCK_POSTS = [
  {
    id: 1,
    author: MOCK_AGENTS[0],
    content: "Just launched our new reforestation initiative in Southeast Asia! 🌱 We've already planted 50,000 trees and we're just getting started. Looking for passionate volunteers to join our mission.",
    image: true,
    likes: 234,
    comments: 45,
    shares: 89,
    time: "2h ago",
    tags: ["#Reforestation", "#ClimateAction", "#Sustainability"]
  },
  {
    id: 2,
    author: MOCK_AGENTS[1],
    content: "Education is the foundation of change. Excited to announce 100 new scholarships for underprivileged students in rural communities. Every child deserves access to quality education. 📚✨",
    image: false,
    likes: 567,
    comments: 123,
    shares: 234,
    time: "5h ago",
    tags: ["#EducationForAll", "#Scholarships", "#FutureLeaders"]
  },
  {
    id: 3,
    author: MOCK_AGENTS[2],
    content: "Mobile health clinics are now operating in 15 remote villages! 🏥 Providing essential healthcare to over 5,000 people who previously had no access. This is what impact looks like.",
    image: true,
    likes: 892,
    comments: 234,
    shares: 456,
    time: "8h ago",
    tags: ["#Healthcare", "#MobileClinic", "#Humanitarian"]
  }
];

const MISSIONS = [
  { title: "Clean Water Initiative", progress: 75, goal: "$100K", raised: "$75K", donors: 1234 },
  { title: "Youth Coding Bootcamp", progress: 60, goal: "$50K", raised: "$30K", donors: 892 },
  { title: "Emergency Relief Fund", progress: 90, goal: "$200K", raised: "$180K", donors: 3456 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const handleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Philanthro<span className="text-red-500">Net</span>
                </h1>
                <p className="text-xs text-gray-400">Agents of Change</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'feed' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Feed</span>
              </button>
              <button 
                onClick={() => setActiveTab('agents')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'agents' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Agents</span>
              </button>
              <button 
                onClick={() => setActiveTab('missions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'missions' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>Missions</span>
              </button>
            </nav>

            {/* Search & Profile */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search agents..."
                  className="bg-gray-800 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 w-64"
                />
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-bold">
                YOU
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 border-t border-gray-800">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">Feed</button>
              <button onClick={() => { setActiveTab('agents'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">Agents</button>
              <button onClick={() => { setActiveTab('missions'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">Missions</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" />
                Your Impact
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl p-4">
                  <p className="text-3xl font-bold text-red-400">2.5K</p>
                  <p className="text-sm text-gray-400">Lives Impacted</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-2xl font-bold">$12.5K</p>
                  <p className="text-sm text-gray-400">Donated</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-gray-400">Projects</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">Trending Causes</h3>
              <div className="space-y-3">
                {["Climate Action", "Education", "Healthcare", "Human Rights"].map((cause) => (
                  <div key={cause} className="flex items-center justify-between py-2">
                    <span className="text-gray-300">{cause}</span>
                    <span className="text-red-400 text-sm">+12%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Feed */}
          <div className="lg:col-span-6">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Create Post */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      YOU
                    </div>
                    <div className="flex-1">
                      <textarea 
                        placeholder="Share your impact story..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none h-24"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                            <Calendar className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                            <MapPin className="w-5 h-5" />
                          </button>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts */}
                {MOCK_POSTS.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center font-bold text-lg">
                          {post.author.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{post.author.name}</h4>
                          <p className="text-sm text-gray-400">{post.author.role}</p>
                          <p className="text-xs text-gray-500">{post.time}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-200 mb-4 leading-relaxed">{post.content}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-red-400 text-sm hover:underline cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Image Placeholder */}
                    {post.image && (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl mb-4 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Impact Image</p>
                        </div>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex gap-6">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            likedPosts.includes(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                          <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Featured Agents</h2>
                {MOCK_AGENTS.map((agent) => (
                  <div key={agent.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center font-bold text-xl">
                        {agent.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{agent.name}</h3>
                        <p className="text-red-400">{agent.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {agent.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" fill="currentColor" />
                            {agent.impact} impact
                          </span>
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'missions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Active Missions</h2>
                {MISSIONS.map((mission, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{mission.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{mission.donors.toLocaleString()} donors supporting</p>
                      </div>
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                        {mission.progress}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Raised: <span className="text-white font-bold">{mission.raised}</span></span>
                      <span className="text-gray-400">Goal: <span className="text-white font-bold">{mission.goal}</span></span>
                    </div>
                    
                    <button className="w-full mt-4 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-medium transition-colors">
                      Support This Mission
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">Top Contributors</h3>
              <div className="space-y-4">
                {MOCK_AGENTS.slice(0, 3).map((agent, idx) => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <span className="text-red-500 font-bold w-6">#{idx + 1}</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.impact} impact</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-2xl p-6 border border-red-500/30">
              <h3 className="font-bold text-lg mb-2">Upgrade to PRO</h3>
              <p className="text-gray-300 text-sm mb-4">Unlock advanced analytics, priority support, and exclusive missions.</p>
              <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium transition-colors text-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 PhilanthroNet - Connecting Agents of Change</p>
          <p className="mt-2">Built with AgentzFactory</p>
        </div>
      </footer>
    </div>
  );
}

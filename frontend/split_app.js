const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const appJsPath = path.join(srcPath, 'App.js');
const lines = fs.readFileSync(appJsPath, 'utf8').split('\n');

const extract = (startLine, endLine) => lines.slice(startLine - 1, endLine).join('\n');

const files = [
  { path: 'pages/Landing.jsx', start: 240, end: 348 },
  { path: 'pages/AuthPage.jsx', start: 349, end: 473 },
  { path: 'features/coach/CoachDashboard.jsx', start: 474, end: 951 },
  { path: 'features/athlete/AthleteDashboard.jsx', start: 952, end: 1035 },
  { path: 'features/coach/SheetEditor.jsx', start: 1036, end: 1985 },
  { path: 'features/coach/SheetHistory.jsx', start: 1986, end: 2055 },
  { path: 'pages/ChatPage.jsx', start: 2056, end: 2219 },
  { path: 'pages/ProgressPage.jsx', start: 2220, end: 2680 }
];

const imports = `import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sun, Moon, LogOut, Plus, Users, FileText, Trash2, Copy, 
  MessageSquare, History, ChevronRight, ChevronDown, Menu, X, Send, 
  Dumbbell, User, Settings, Home, ArrowLeft, Check, Edit2, Link as LinkIcon, Video, Archive, TrendingUp
} from "lucide-react";
import { useAuth, API, WS_URL } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
`;

files.forEach(f => {
  const content = imports + '\n' + extract(f.start, f.end);
  const outPath = path.join(srcPath, f.path);
  // add default export
  const finalContent = content + `\nexport default ${f.path.split('/').pop().replace('.jsx', '')};\n`;
  fs.writeFileSync(outPath, finalContent);
  console.log('Created ' + outPath);
});

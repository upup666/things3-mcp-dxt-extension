# Things 3 Extended MCP Server - DXT Extension

A comprehensive Desktop Extension (DXT) for Things 3 task management integration with enhanced capabilities including task movement, editing, and backup functionality.

## Features

### 📋 **Viewing Operations**
- `view_inbox` - View all tasks in Things 3 inbox
- `view_today` - View all tasks scheduled for today  
- `view_projects` - View all projects in Things 3
- `view_areas` - View all areas in Things 3

### ➕ **Creation Operations**
- `create_task` - Create new tasks with full metadata (notes, dates, tags, checklists)
- `create_project` - Create new projects with areas and scheduling
- `create_area` - Create new organizational areas

### 🔄 **Task Movement Operations**
- `move_task_to_inbox` - Move tasks from today/other lists back to inbox
- `move_task_to_today` - Schedule inbox tasks for today
- `move_task_to_project` - Assign tasks to specific projects
- `move_task_to_area` - Move tasks to specific areas

### ✏️ **Editing Operations**
- `edit_task` - Modify existing task properties (title, notes, dates, tags)
- `edit_project` - Update project details and metadata

### 🔍 **Management Operations**  
- `search_tasks` - Search tasks by title or content
- `complete_task` - Mark tasks as completed

### 💾 **Backup & Restore Operations**
- `backup_things3` - Create comprehensive backup of all Things 3 data
- `restore_things3` - Load backup data (analysis and reference)

## Installation

### Prerequisites
- **macOS** (required for Things 3)
- **Things 3** application installed
- **Node.js** 18.0.0 or higher
- **DXT-compatible host** (Claude Desktop, etc.)

### Install Dependencies
```bash
cd server
npm install
```

### Package as DXT Extension
Since DXT CLI is not yet publicly available, create the package manually:
```bash
# Create DXT package (ZIP format)
zip -r things3-mcp-dxt-extension-v1.0.0.dxt . -x "*.git*" "*.DS_Store*" "*.dxt" ".claude/*" "reddit_post.md"
```

**Important:** Exclude `.claude/` directory to avoid installation errors in Claude Desktop.

### Add to Host Application
Add the extension to your MCP-compatible host's configuration:

```json
{
  "mcpServers": {
    "things3-extended": {
      "command": "node",
      "args": ["/path/to/extension/server/index.js"]
    }
  }
}
```

## Usage Examples

### Task Management Workflow
```javascript
// View what's in your inbox
await callTool("view_inbox");

// Create a new task
await callTool("create_task", {
  title: "Review quarterly reports",
  notes: "Focus on sales and marketing metrics",
  when: "today",
  tags: "work,review"
});

// Move task from today to a specific project
await callTool("move_task_to_project", {
  title: "Review quarterly reports", 
  project: "Q4 Planning"
});

// Edit the task to add a deadline
await callTool("edit_task", {
  current_title: "Review quarterly reports",
  deadline: "2024-12-31"
});
```

### Backup & Recovery
```javascript
// Create backup
await callTool("backup_things3", {
  backup_path: "/Users/username/Desktop/things3_backup.json"
});

// Analyze backup contents
await callTool("restore_things3", {
  backup_path: "/Users/username/Desktop/things3_backup.json"
});
```

## Technical Implementation

### Architecture
- **MCP Protocol**: Uses `@modelcontextprotocol/sdk` for communication
- **AppleScript Integration**: Direct interaction with Things 3 via AppleScript
- **URL Schemes**: Leverages Things 3 URL schemes for creation operations
- **Error Handling**: Comprehensive timeout and error management

### Security Features
- Input sanitization for AppleScript injection prevention
- URL encoding for special characters
- Timeout protection (10 second limit)
- Safe string escaping

### Performance Considerations
- Async operations throughout
- Efficient AppleScript execution
- JSON parsing with fallback defaults
- Memory-efficient data handling

## API Reference

### Task Creation Parameters
```javascript
{
  title: string,        // Required
  notes: string,        // Optional
  when: string,         // Optional - "today", "tomorrow", "2024-12-31"
  deadline: string,     // Optional - Date string
  tags: string,         // Optional - Comma-separated
  list: string,         // Optional - Project/area name
  checklist: string     // Optional - Checklist items
}
```

### Backup Data Structure
```javascript
{
  timestamp: "2024-12-01T10:00:00Z",
  version: "1.0.0",
  data: {
    inbox: [...],     // Array of inbox tasks
    today: [...],     // Array of today's tasks  
    projects: [...],  // Array of projects
    areas: [...]      // Array of areas
  }
}
```

## Troubleshooting

### Common Issues
1. **"Things 3 not responding"**
   - Ensure Things 3 is running
   - Check macOS permissions for AppleScript

2. **"Task not found" errors**
   - Search uses partial matching
   - Check exact task titles
   - Tasks may be in different lists

3. **Backup/restore failures**
   - Verify file path permissions
   - Ensure sufficient disk space
   - Check JSON syntax in backup files

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
```bash
NODE_ENV=development node server/index.js
```

## License

MIT License - See LICENSE file for details.

## Repository

GitHub: [https://github.com/upup666/things3-mcp-dxt-extension](https://github.com/upup666/things3-mcp-dxt-extension)

## Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## Issues & Support

Report issues at: [https://github.com/upup666/things3-mcp-dxt-extension/issues](https://github.com/upup666/things3-mcp-dxt-extension/issues)

---

🚀 **Ready to supercharge your Things 3 workflow with AI assistance!**
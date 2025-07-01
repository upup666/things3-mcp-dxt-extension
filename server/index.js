#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

class Things3MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "things3-mcp-extended",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Viewing tools
        {
          name: "view_inbox",
          description: "View all tasks in Things 3 inbox",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "view_today",
          description: "View all tasks scheduled for today",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "view_projects",
          description: "View all projects in Things 3",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "view_areas",
          description: "View all areas in Things 3",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        // Creation tools
        {
          name: "create_task",
          description: "Create a new task in Things 3",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              notes: { type: "string" },
              when: { type: "string" },
              deadline: { type: "string" },
              tags: { type: "string" },
              list: { type: "string" },
              checklist: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "create_project",
          description: "Create a new project in Things 3",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              notes: { type: "string" },
              area: { type: "string" },
              when: { type: "string" },
              deadline: { type: "string" },
              tags: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "create_area",
          description: "Create a new area in Things 3",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              tags: { type: "string" },
            },
            required: ["title"],
          },
        },
        // Management tools
        {
          name: "complete_task",
          description: "Mark a task as completed",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "search_tasks",
          description: "Search for tasks by title or content",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
        },
        // Moving tools
        {
          name: "move_task_to_inbox",
          description: "Move a task from today/other lists to inbox",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "move_task_to_today",
          description: "Move a task from inbox to today",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "move_task_to_project",
          description: "Move a task to a specific project",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              project: { type: "string" },
            },
            required: ["title", "project"],
          },
        },
        {
          name: "move_task_to_area",
          description: "Move a task to a specific area",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              area: { type: "string" },
            },
            required: ["title", "area"],
          },
        },
        // Editing tools
        {
          name: "edit_task",
          description: "Edit an existing task",
          inputSchema: {
            type: "object",
            properties: {
              current_title: { type: "string" },
              new_title: { type: "string" },
              notes: { type: "string" },
              when: { type: "string" },
              deadline: { type: "string" },
              tags: { type: "string" },
            },
            required: ["current_title"],
          },
        },
        {
          name: "edit_project",
          description: "Edit an existing project",
          inputSchema: {
            type: "object",
            properties: {
              current_title: { type: "string" },
              new_title: { type: "string" },
              notes: { type: "string" },
              area: { type: "string" },
              when: { type: "string" },
              deadline: { type: "string" },
              tags: { type: "string" },
            },
            required: ["current_title"],
          },
        },
        // Backup/Restore tools
        {
          name: "backup_things3",
          description: "Create a backup of all Things 3 data",
          inputSchema: {
            type: "object",
            properties: {
              backup_path: { type: "string" },
            },
          },
        },
        {
          name: "restore_things3",
          description: "Restore Things 3 data from backup",
          inputSchema: {
            type: "object",
            properties: {
              backup_path: { type: "string" },
            },
            required: ["backup_path"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;
        switch (name) {
          case "view_inbox":
            result = await this.viewInbox();
            break;
          case "view_today":
            result = await this.viewToday();
            break;
          case "view_projects":
            result = await this.viewProjects();
            break;
          case "view_areas":
            result = await this.viewAreas();
            break;
          case "create_task":
            result = await this.createTask(args);
            break;
          case "create_project":
            result = await this.createProject(args);
            break;
          case "create_area":
            result = await this.createArea(args);
            break;
          case "complete_task":
            result = await this.completeTask(args);
            break;
          case "search_tasks":
            result = await this.searchTasks(args);
            break;
          case "move_task_to_inbox":
            result = await this.moveTaskToInbox(args);
            break;
          case "move_task_to_today":
            result = await this.moveTaskToToday(args);
            break;
          case "move_task_to_project":
            result = await this.moveTaskToProject(args);
            break;
          case "move_task_to_area":
            result = await this.moveTaskToArea(args);
            break;
          case "edit_task":
            result = await this.editTask(args);
            break;
          case "edit_project":
            result = await this.editProject(args);
            break;
          case "backup_things3":
            result = await this.backupThings3(args);
            break;
          case "restore_things3":
            result = await this.restoreThings3(args);
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error.message}`
        );
      }
    });
  }

  // AppleScript execution helper
  async executeAppleScript(script) {
    try {
      const result = execSync(`osascript -e '${script.replace(/'/g, "\\'")}'`, {
        encoding: "utf8",
        timeout: 10000,
      });
      return result.trim();
    } catch (error) {
      throw new Error(`AppleScript execution failed: ${error.message}`);
    }
  }

  // Escape strings for AppleScript
  escapeAppleScriptString(str) {
    if (!str) return "";
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  // View operations
  async viewInbox() {
    const script = `
      tell application "Things3"
        set inboxTodos to to dos of list "Inbox"
        set todoList to {}
        repeat with todo in inboxTodos
          set todoInfo to "{" & \\
            "\\"title\\": \\"" & (name of todo) & "\\", " & \\
            "\\"notes\\": \\"" & (notes of todo) & "\\", " & \\
            "\\"status\\": \\"" & (status of todo) & "\\"" & \\
            "}"
          set end of todoList to todoInfo
        end repeat
        return "[" & (my join(todoList, ",")) & "]"
      end tell
      
      on join(lst, delim)
        set AppleScript's text item delimiters to delim
        set str to lst as string
        set AppleScript's text item delimiters to ""
        return str
      end join
    `;
    
    const result = await this.executeAppleScript(script);
    return JSON.parse(result || "[]");
  }

  async viewToday() {
    const script = `
      tell application "Things3"
        set todayTodos to to dos of list "Today"
        set todoList to {}
        repeat with todo in todayTodos
          set todoInfo to "{" & \\
            "\\"title\\": \\"" & (name of todo) & "\\", " & \\
            "\\"notes\\": \\"" & (notes of todo) & "\\", " & \\
            "\\"status\\": \\"" & (status of todo) & "\\"" & \\
            "}"
          set end of todoList to todoInfo
        end repeat
        return "[" & (my join(todoList, ",")) & "]"
      end tell
      
      on join(lst, delim)
        set AppleScript's text item delimiters to delim
        set str to lst as string
        set AppleScript's text item delimiters to ""
        return str
      end join
    `;
    
    const result = await this.executeAppleScript(script);
    return JSON.parse(result || "[]");
  }

  async viewProjects() {
    const script = `
      tell application "Things3"
        set allProjects to projects
        set projectList to {}
        repeat with proj in allProjects
          set projectInfo to "{" & \\
            "\\"title\\": \\"" & (name of proj) & "\\", " & \\
            "\\"notes\\": \\"" & (notes of proj) & "\\", " & \\
            "\\"status\\": \\"" & (status of proj) & "\\"" & \\
            "}"
          set end of projectList to projectInfo
        end repeat
        return "[" & (my join(projectList, ",")) & "]"
      end tell
      
      on join(lst, delim)
        set AppleScript's text item delimiters to delim
        set str to lst as string
        set AppleScript's text item delimiters to ""
        return str
      end join
    `;
    
    const result = await this.executeAppleScript(script);
    return JSON.parse(result || "[]");
  }

  async viewAreas() {
    const script = `
      tell application "Things3"
        set allAreas to areas
        set areaList to {}
        repeat with area in allAreas
          set areaInfo to "{" & \\
            "\\"title\\": \\"" & (name of area) & "\\"" & \\
            "}"
          set end of areaList to areaInfo
        end repeat
        return "[" & (my join(areaList, ",")) & "]"
      end tell
      
      on join(lst, delim)
        set AppleScript's text item delimiters to delim
        set str to lst as string
        set AppleScript's text item delimiters to ""
        return str
      end join
    `;
    
    const result = await this.executeAppleScript(script);
    return JSON.parse(result || "[]");
  }

  // Creation operations
  async createTask(args) {
    const { title, notes, when, deadline, tags, list, checklist } = args;
    
    let url = `things:///add?title=${encodeURIComponent(title)}`;
    if (notes) url += `&notes=${encodeURIComponent(notes)}`;
    if (when) url += `&when=${encodeURIComponent(when)}`;
    if (deadline) url += `&deadline=${encodeURIComponent(deadline)}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;
    if (list) url += `&list=${encodeURIComponent(list)}`;
    if (checklist) url += `&checklist-items=${encodeURIComponent(checklist)}`;

    const script = `tell application "System Events" to open location "${url}"`;
    await this.executeAppleScript(script);
    
    return { success: true, message: `Task "${title}" created successfully` };
  }

  async createProject(args) {
    const { title, notes, area, when, deadline, tags } = args;
    
    let url = `things:///add-project?title=${encodeURIComponent(title)}`;
    if (notes) url += `&notes=${encodeURIComponent(notes)}`;
    if (area) url += `&area=${encodeURIComponent(area)}`;
    if (when) url += `&when=${encodeURIComponent(when)}`;
    if (deadline) url += `&deadline=${encodeURIComponent(deadline)}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;

    const script = `tell application "System Events" to open location "${url}"`;
    await this.executeAppleScript(script);
    
    return { success: true, message: `Project "${title}" created successfully` };
  }

  async createArea(args) {
    const { title, tags } = args;
    
    let url = `things:///add-area?title=${encodeURIComponent(title)}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;

    const script = `tell application "System Events" to open location "${url}"`;
    await this.executeAppleScript(script);
    
    return { success: true, message: `Area "${title}" created successfully` };
  }

  // Management operations
  async completeTask(args) {
    const { title } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(title)}"
        if (count of foundTodos) > 0 then
          set status of first item of foundTodos to completed
          return "Task completed successfully"
        else
          return "Task not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  async searchTasks(args) {
    const { query } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(query)}" or notes contains "${this.escapeAppleScriptString(query)}"
        set todoList to {}
        repeat with todo in foundTodos
          set todoInfo to "{" & \\
            "\\"title\\": \\"" & (name of todo) & "\\", " & \\
            "\\"notes\\": \\"" & (notes of todo) & "\\", " & \\
            "\\"status\\": \\"" & (status of todo) & "\\"" & \\
            "}"
          set end of todoList to todoInfo
        end repeat
        return "[" & (my join(todoList, ",")) & "]"
      end tell
      
      on join(lst, delim)
        set AppleScript's text item delimiters to delim
        set str to lst as string
        set AppleScript's text item delimiters to ""
        return str
      end join
    `;
    
    const result = await this.executeAppleScript(script);
    return JSON.parse(result || "[]");
  }

  // Movement operations
  async moveTaskToInbox(args) {
    const { title } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(title)}"
        if (count of foundTodos) > 0 then
          move first item of foundTodos to list "Inbox"
          return "Task moved to Inbox successfully"
        else
          return "Task not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  async moveTaskToToday(args) {
    const { title } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(title)}"
        if (count of foundTodos) > 0 then
          set scheduled date of first item of foundTodos to (current date)
          return "Task moved to Today successfully"
        else
          return "Task not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  async moveTaskToProject(args) {
    const { title, project } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(title)}"
        set foundProjects to projects whose name contains "${this.escapeAppleScriptString(project)}"
        if (count of foundTodos) > 0 and (count of foundProjects) > 0 then
          move first item of foundTodos to first item of foundProjects
          return "Task moved to project successfully"
        else
          return "Task or project not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  async moveTaskToArea(args) {
    const { title, area } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(title)}"
        set foundAreas to areas whose name contains "${this.escapeAppleScriptString(area)}"
        if (count of foundTodos) > 0 and (count of foundAreas) > 0 then
          move first item of foundTodos to first item of foundAreas
          return "Task moved to area successfully"
        else
          return "Task or area not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  // Editing operations
  async editTask(args) {
    const { current_title, new_title, notes, when, deadline, tags } = args;
    
    const script = `
      tell application "Things3"
        set foundTodos to to dos whose name contains "${this.escapeAppleScriptString(current_title)}"
        if (count of foundTodos) > 0 then
          set targetTodo to first item of foundTodos
          ${new_title ? `set name of targetTodo to "${this.escapeAppleScriptString(new_title)}"` : ""}
          ${notes ? `set notes of targetTodo to "${this.escapeAppleScriptString(notes)}"` : ""}
          ${when ? `set scheduled date of targetTodo to date "${this.escapeAppleScriptString(when)}"` : ""}
          ${deadline ? `set due date of targetTodo to date "${this.escapeAppleScriptString(deadline)}"` : ""}
          return "Task updated successfully"
        else
          return "Task not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  async editProject(args) {
    const { current_title, new_title, notes, area, when, deadline, tags } = args;
    
    const script = `
      tell application "Things3"
        set foundProjects to projects whose name contains "${this.escapeAppleScriptString(current_title)}"
        if (count of foundProjects) > 0 then
          set targetProject to first item of foundProjects
          ${new_title ? `set name of targetProject to "${this.escapeAppleScriptString(new_title)}"` : ""}
          ${notes ? `set notes of targetProject to "${this.escapeAppleScriptString(notes)}"` : ""}
          ${when ? `set scheduled date of targetProject to date "${this.escapeAppleScriptString(when)}"` : ""}
          ${deadline ? `set due date of targetProject to date "${this.escapeAppleScriptString(deadline)}"` : ""}
          return "Project updated successfully"
        else
          return "Project not found"
        end if
      end tell
    `;
    
    const result = await this.executeAppleScript(script);
    return { success: true, message: result };
  }

  // Backup/Restore operations
  async backupThings3(args) {
    const backupPath = args.backup_path || `/Users/${process.env.USER}/Desktop/things3_backup_${Date.now()}.json`;
    
    try {
      // Get all data from Things 3
      const inbox = await this.viewInbox();
      const today = await this.viewToday();
      const projects = await this.viewProjects();
      const areas = await this.viewAreas();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        data: {
          inbox,
          today,
          projects,
          areas
        }
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      return { 
        success: true, 
        message: `Backup created successfully at ${backupPath}`,
        backup_path: backupPath
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restoreThings3(args) {
    const { backup_path } = args;
    
    try {
      if (!fs.existsSync(backup_path)) {
        throw new Error("Backup file not found");
      }
      
      const backupData = JSON.parse(fs.readFileSync(backup_path, 'utf8'));
      
      // Note: Full restore would require more complex logic
      // This is a simplified version that demonstrates the concept
      
      return { 
        success: true, 
        message: `Backup data loaded from ${backup_path}. Note: Full restore functionality requires manual implementation based on specific requirements.`,
        backup_info: {
          timestamp: backupData.timestamp,
          version: backupData.version,
          items_count: {
            inbox: backupData.data.inbox?.length || 0,
            today: backupData.data.today?.length || 0,
            projects: backupData.data.projects?.length || 0,
            areas: backupData.data.areas?.length || 0
          }
        }
      };
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Things 3 MCP Server running on stdio");
  }
}

const server = new Things3MCPServer();
server.run().catch(console.error);
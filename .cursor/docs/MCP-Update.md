{

&#x20; "mcpServers": {

&#x20;  "novamira-active": {

&#x20;     "command": "npx",

&#x20;     "args": \[

&#x20;       "-y",

&#x20;       "@automattic/mcp-wordpress-remote@latest"

&#x20;     ],

&#x20;     "env": {

&#x20;       "WP\_API\_URL": "http://novamirav3.local/wp-json/mcp/mcp-adapter-default-server",

&#x20;       "WP\_API\_USERNAME": "novaAdmin",

&#x20;       "WP\_API\_PASSWORD": "YKYneKTfIXwcDyR0wWgnDBRj"

&#x20;     }

&#x20;   },

&#x20;   "local-wp": {

&#x20;     "command": "cmd",

&#x20;     "args": \[

&#x20;       "/c",

&#x20;       "npx",

&#x20;       "-y",

&#x20;       "@verygoodplugins/mcp-local-wp@latest"

&#x20;     ]

&#x20;   },

&#x20;   "fetch": {

&#x20;     "command": "python",

&#x20;     "args": \[

&#x20;       "-m",

&#x20;       "mcp\_server\_fetch",

&#x20;       "--ignore-robots-txt"

&#x20;     ]

&#x20;   },

&#x20;   "github": {

&#x20;     "command": "npx",

&#x20;     "args": \[

&#x20;       "-y",

&#x20;       "@modelcontextprotocol/server-github@latest"

&#x20;     ],

&#x20;     "env": {

&#x20;       "GITHUB\_PERSONAL\_ACCESS\_TOKEN": "ghp\_GUIJS5gx9u952vwmlaRamNJiQS1CyI35wixT"

&#x20;     }

&#x20;   },

&#x20;   "playwright": {

&#x20;     "command": "npx",

&#x20;     "args": \[

&#x20;       "-y",

&#x20;       "@playwright/mcp@latest",

&#x20;       "--browser",

&#x20;       "firefox"

&#x20;     ]

&#x20;   },    

&#x20;   "console-ninja": {

&#x20;     "command": "node",

&#x20;     "args": \[

&#x20;       "\~/.console-ninja/mcp/"

&#x20;     ]

&#x20;   },

&#x20;   "untitledui": {

&#x20;     "url": "https://www.untitledui.com/react/api/mcp"

&#x20;   }    

&#x20; }

}


// This file exports the HTML content of the original public/index.html as a string
export const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello, World!</title>
  </head>
  <body>
    <h1>Welcome to Fastlane Worker</h1>
    <p>This site explores the world of AI Agents and Content Publishers.</p>
    <nav>
      <ul>
        <li><a href="/agents.html">Example content</a></li>
      </ul>
    </nav>
    <h2>Agents List</h2>
    <div id="agents-table-container">Loading agents...</div>
    <script>
      async function loadAgents() {
        const container = document.getElementById("agents-table-container");
        try {
          const resp = await fetch("/api/agents");
          if (!resp.ok) throw new Error("Failed to fetch agents");
          const agents = await resp.json();
          if (!Array.isArray(agents) || agents.length === 0) {
            container.textContent = "No agents found.";
            return;
          }
          // Create table
          const table = document.createElement("table");
          table.style.borderCollapse = "collapse";
          table.style.width = "100%";
          // Table header
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          Object.keys(agents[0]).forEach((key) => {
            const th = document.createElement("th");
            th.textContent = key;
            th.style.border = "1px solid #ccc";
            th.style.padding = "8px";
            th.style.background = "#f0f4fa";
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);
          // Table body
          const tbody = document.createElement("tbody");
          agents.forEach((agent) => {
            const row = document.createElement("tr");
            Object.values(agent).forEach((val) => {
              const td = document.createElement("td");
              td.textContent = val;
              td.style.border = "1px solid #ccc";
              td.style.padding = "8px";
              row.appendChild(td);
            });
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
          container.innerHTML = "";
          container.appendChild(table);
        } catch (e) {
          container.textContent = "Error loading agents: " + e.message;
        }
      }
      loadAgents();
    </script>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 2rem;
        background: #f9f9f9;
        color: #222;
      }
      h1 {
        color: #2a4d7c;
      }
      nav ul {
        list-style: none;
        padding: 0;
      }
      nav li {
        margin: 1rem 0;
      }
      nav a {
        color: #1a73e8;
        text-decoration: none;
        font-size: 1.2rem;
      }
      nav a:hover {
        text-decoration: underline;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 1rem;
      }
      th,
      td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }
      th {
        background: #f0f4fa;
      }
    </style>
  </body>
</html>
`;

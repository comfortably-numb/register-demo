var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);
  if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/user.json"));
    const array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      console.log(array);
      const string = Buffer.concat(array).toString();
      const obj = JSON.parse(string);
      const lastUser = userArray[userArray.length - 1];
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);
      fs.writeFileSync("./db/user.json", JSON.stringify(userArray));
      response.end("很好");
    });
  } else {
    const filePath = path === "/" ? "/index.html" : path;
    const index = filePath.lastIndexOf(".");
    const suffix = filePath.substring(index);
    const fileTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };
    response.setHeader(
      "Content-Type",
      `${fileTypes[suffix] || "text/html"};charset=utf-8`
    );
    console.log("filepath:" + `./public${filePath}`);
    let content;
    try {
      response.statusCode = 200;
      content = fs.readFileSync(`./public${filePath}`);
    } catch (error) {
      response.statusCode = 404;
      content = "文件不存在";
    }
    response.write(content);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);

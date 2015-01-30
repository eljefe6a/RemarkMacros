# RemarkMacros
Some macros I've created for Remark.

### Using SourceCreator

SourceCreator uses brings modules together to create a class.

Here is the JavaScript code:

```javascript
var sourceCreator = new SourceCreator();
var source = sourceCreator.createSource("class.json");
```

Here is the JSON for the `class.json` file:

```javascript
{
        "classname" : "Name of the class",
        "classdescription" : "Option class description",
        "classmodules" : [
                "path/to/remark/foo.md",
                "another/path/to/remark/bar.md"
        ]
}
```

### Using Include Source

The Include Source macro allows you to import code from a file in a project without embedding it in the Markdown.

Here is the JavaScript code:

```javascript
var includeSourceMacro = new IncludeSourceMacro();
```

Here is how to use it in the Markdown:

```markdown
![:includesource "Class.java"]
```

Will include Class.java with source code and add the code block with the file extension "java"

```markdown
![:includesource "Class.java", 2-4, 3, *]
```

Will include lines 2 to 4 from Class.java and highlight line 3 with an *

```markdown
![:includesource "Class.java", 2-4, 3 4, * trim]
```

Will include lines 2 to 4 from Class.java and highlight lines 3 and 4 with an * then trim the whitespace to the minimum needed for lines 2 to 4.

### Using Source Stats

Source Stats does a time calculation based on number of slides you have in your slideshow and about many slides per hour you cover.

```javascript
var sourceStats = new SourceStats();
sourceStats.outputStats(slideshow, 25);
```

The output goes to the `console.log` for now.
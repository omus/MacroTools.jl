var documenterSearchIndex = {"docs":
[{"location":"#MacroTools.jl-1","page":"Home","title":"MacroTools.jl","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"MacroTools provides a library of tools for working with Julia code and expressions. This includes a powerful template-matching system and code-walking tools that let you do deep transformations of code in a few lines.","category":"page"},{"location":"pattern-matching/#Pattern-Matching-1","page":"Pattern Matching","title":"Pattern Matching","text":"","category":"section"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"With pattern matching enables macro writers to deconstruct Julia expressions in a more declarative way, and without having to know in great detail how syntax is represented internally. For example, say you have a type definition:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"ex = quote\n  struct Foo\n    x::Int\n    y\n  end\nend","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"If you know what you're doing, you can pull out the name and fields via:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> if isexpr(ex.args[2], :struct)\n         (ex.args[2].args[2], ex.args[2].args[3].args)\n       end\n(:Foo,{:( # line 3:),:(x::Int),:( # line 4:),:y})","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"But this is hard to write – since you have to deconstruct the type expression by hand – and hard to read, since you can't tell at a glance what's being achieved. On top of that, there's a bunch of messy stuff to deal with like pesky begin blocks which wrap a single expression, line numbers, etc. etc.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Enter MacroTools:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> using MacroTools\n\njulia> @capture(ex, struct T_ fields__ end)\ntrue\n\njulia> T, fields\n(:Foo, [:(x::Int), :y])","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Symbols like T_ underscore are treated as catchalls which match any expression, and the expression they match is bound to the (underscore-less) variable, as above.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Because @capture doubles as a test as well as extracting values, you can easily handle unexpected input (try writing this by hand):","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture(ex, f_(xs__) where {T_} = body_) ||\n  error(\"expected a function with a single type parameter\")","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Symbols like f__ (double underscored) are similar, but slurp a sequence of arguments into an array. For example:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> @capture(:[1, 2, 3, 4, 5, 6, 7], [1, a_, 3, b__, c_])\ntrue\n\njulia> a, b, c\n(2,[4,5,6],7)","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Slurps don't have to be at the end of an expression, but like the Highlander there can only be one (per expression).","category":"page"},{"location":"pattern-matching/#Matching-on-expression-type-1","page":"Pattern Matching","title":"Matching on expression type","text":"","category":"section"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture can match expressions by their type, which is either the head of Expr objects or the typeof atomic stuff like Symbols and Ints. For example:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture(ex, foo(x_String_string))","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"This will match a call to the foo function which has a single argument, which may either be a String object or a Expr(:string, ...) (e.g. @capture(:(foo(\"$(a)\")), foo(x_String_string))). Julia string literals may be parsed into either type of object, so this is a handy way to catch both.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Another common use case is to catch symbol literals, e.g.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture(ex,\n  struct T_Symbol\n    fields__\n  end)","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"which will match e.g. struct Foo ... but not struct Foo{V} ...","category":"page"},{"location":"pattern-matching/#Unions-1","page":"Pattern Matching","title":"Unions","text":"","category":"section"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture can also try to match the expression against one pattern or another, for example:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture(ex, (f_(args__) = body_) | (function f_(args__) body_ end))","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"will match both kinds of function syntax (though it's easier to use shortdef to normalise definitions). You can also do this within expressions, e.g.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"@capture(ex, (f_(args__) where {T_}) | (f_(args__)) = body_)","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"matches a function definition like func(a::T) where {T<:Number} = supertype(T), with a single type parameter bound to T if possible. If not, T = nothing.","category":"page"},{"location":"pattern-matching/#Expression-Walking-1","page":"Pattern Matching","title":"Expression Walking","text":"","category":"section"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"If you've ever written any more interesting macros, you've probably found yourself writing recursive functions to work with nested Expr trees. MacroTools' prewalk and postwalk functions factor out the recursion, making macro code much more concise and robust.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"These expression-walking functions essentially provide a kind of find-and-replace for expression trees. For example:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> using MacroTools: prewalk, postwalk\n\njulia> postwalk(x -> x isa Integer ? x + 1 : x, :(2+3))\n:(3 + 4)","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"In other words, look at each item in the tree; if it's an integer, add one, if not, leave it alone.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"We can do more complex things if we combine this with @capture. For example, say we want to insert an extra argument into all function calls:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> ex = quote\n         x = f(y, g(z))\n         return h(x)\n       end\n\njulia> postwalk(x -> @capture(x, f_(xs__)) ? :($f(5, $(xs...))) : x, ex)\nquote  # REPL[20], line 2:\n    x = f(5, y, g(5, z)) # REPL[20], line 3:\n    return h(5, x)\nend","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"Most of the time, you can use postwalk without worrying about it, but we also provide prewalk. The difference is the order in which you see sub-expressions; postwalk sees the leaves of the Expr tree first and the whole expression last, while prewalk is the opposite.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> postwalk(x -> @show(x) isa Integer ? x + 1 : x, :(2+3*4));\nx = :+\nx = 2\nx = :*\nx = 3\nx = 4\nx = :(4 * 5)\nx = :(3 + 4 * 5)\n\njulia> prewalk(x -> @show(x) isa Integer ? x + 1 : x, :(2+3*4));\nx = :(2 + 3 * 4)\nx = :+\nx = 2\nx = :(3 * 4)\nx = :*\nx = 3\nx = 4","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"A significant difference is that prewalk will walk into whatever expression you return.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"julia> postwalk(x -> @show(x) isa Integer ? :(a+b) : x, 2)\nx = 2\n:(a + b)\n\njulia> prewalk(x -> @show(x) isa Integer ? :(a+b) : x, 2)\nx = 2\nx = :+\nx = :a\nx = :b\n:(a + b)","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"This makes it somewhat more prone to infinite loops; for example, if we returned :(1+b) instead of :(a+b), prewalk would hang trying to expand all of the 1s in the expression.","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"With these tools in hand, a useful general pattern for macros is:","category":"page"},{"location":"pattern-matching/#","page":"Pattern Matching","title":"Pattern Matching","text":"macro foo(ex)\n  postwalk(ex) do x\n    @capture(x, some_pattern) || return x\n    return new_x\n  end\nend","category":"page"},{"location":"utilities/#Utilities-1","page":"Utilities","title":"Utilities","text":"","category":"section"},{"location":"utilities/#Function-definitions-1","page":"Utilities","title":"Function definitions","text":"","category":"section"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"Function definitions pose a problem to pattern matching, since there are a lot of different ways to define a function. For example, a pattern that captures f(x) = 2x will not match","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"function f(x)\n  return 2x\nend","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"There are a couple of ways to handle this. One way is to use longdef or shortdef to normalise function definitions to short form, before matching it.","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"julia> ex = :(function f(x) 2x end)\n:(function f(x)\n      #= none:1 =#\n      2x\n  end)\n\njulia> MacroTools.shortdef(ex)\n:(f(x) = begin\n          #= none:1 =#\n          2x\n      end)","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"More generally it's also possible to use splitdef and combinedef to handle the full range of function syntax.","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"splitdef(def) matches a function definition of the form","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"function name(args; kwargs)::rtype where {whereparams}\n   body\nend","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"and returns Dict(:name=>..., :args=>..., etc.). The definition can be rebuilt by calling MacroTools.combinedef(dict), or explicitly with","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"rtype = get(dict, :rtype, :Any)\n:(function $(dict[:name])($(dict[:args]...);\n                          $(dict[:kwargs]...))::$rtype where {$(dict[:whereparams]...)}\n  $(dict[:body].args...)\nend)","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"splitarg(arg) matches function arguments (whether from a definition or a function call) such as x::Int=2 and returns (arg_name, arg_type, slurp, default). default is nothing when there is none. For example:","category":"page"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"> map(splitarg, (:(f(y, a=2, x::Int=nothing, args...))).args[2:end])\n4-element Array{Tuple{Symbol,Symbol,Bool,Any},1}:\n (:y, :Any, false, nothing)  \n (:a, :Any, false, 2)        \n (:x, :Int, false, :nothing)\n (:args, :Any, true, nothing)","category":"page"},{"location":"utilities/#Other-Utilities-1","page":"Utilities","title":"Other Utilities","text":"","category":"section"},{"location":"utilities/#","page":"Utilities","title":"Utilities","text":"MacroTools.isexpr\nMacroTools.rmlines\nMacroTools.unblock\nMacroTools.namify\nMacroTools.inexpr\nMacroTools.gensym_ids\nMacroTools.alias_gensyms\nMacroTools.@expand\nMacroTools.isdef\nMacroTools.flatten\nMacroTools.prettify","category":"page"},{"location":"utilities/#MacroTools.isexpr","page":"Utilities","title":"MacroTools.isexpr","text":"isexpr(x, ts...)\n\nConvenient way to test the type of a Julia expression. Expression heads and types are supported, so for example you can call\n\nisexpr(expr, String, :string)\n\nto pick up on all string-like expressions.\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.rmlines","page":"Utilities","title":"MacroTools.rmlines","text":"rmlines(x)\n\nRemove the line nodes from a block or array of expressions.\n\nCompare quote end vs rmlines(quote end)\n\nExamples\n\nTo work with nested blocks:\n\nprewalk(rmlines, ex)\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.unblock","page":"Utilities","title":"MacroTools.unblock","text":"unblock(expr)\n\nRemove outer begin blocks from an expression, if the block is redundant (i.e. contains only a single expression).\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.namify","page":"Utilities","title":"MacroTools.namify","text":"An easy way to get the (function/type) name out of expressions like foo{T} or Bar{T} <: Vector{T}.\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.inexpr","page":"Utilities","title":"MacroTools.inexpr","text":"inexpr(expr, x)\n\nSimple expression match; will return true if the expression x can be found inside expr.\n\ninexpr(:(2+2), 2) == true\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.gensym_ids","page":"Utilities","title":"MacroTools.gensym_ids","text":"gensym_ids(expr)\n\nReplaces gensyms with unique ids (deterministically).\n\njulia> x, y = gensym(\"x\"), gensym(\"y\")\n(Symbol(\"##x#363\"), Symbol(\"##y#364\"))\n\njulia> MacroTools.gensym_ids(:($x+$y))\n:(x_1 + y_2)\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.alias_gensyms","page":"Utilities","title":"MacroTools.alias_gensyms","text":"alias_gensyms(expr)\n\nReplaces gensyms with animal names. This makes gensym'd code far easier to follow.\n\njulia> x, y = gensym(\"x\"), gensym(\"y\")\n(Symbol(\"##x#363\"), Symbol(\"##y#364\"))\n\njulia> MacroTools.alias_gensyms(:($x+$y))\n:(porcupine + gull)\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.@expand","page":"Utilities","title":"MacroTools.@expand","text":"More convenient macro expansion, e.g.\n\n@expand @time foo()\n\n\n\n\n\n","category":"macro"},{"location":"utilities/#MacroTools.isdef","page":"Utilities","title":"MacroTools.isdef","text":"Test for function definition expressions.\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.flatten","page":"Utilities","title":"MacroTools.flatten","text":"flatten(ex)\n\nFlatten any redundant blocks into a single block, over the whole expression.\n\n\n\n\n\n","category":"function"},{"location":"utilities/#MacroTools.prettify","page":"Utilities","title":"MacroTools.prettify","text":"prettify(ex)\n\nMakes generated code generaly nicer to look at.\n\n\n\n\n\n","category":"function"}]
}

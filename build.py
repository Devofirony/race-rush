import pathlib
p=pathlib.Path(__file__).parent
js='\n'.join((p/'src'/f).read_text() for f in ['art.js','game.js','render.js'])
(p/'src/_all.js').write_text(js)
s=(p/'src/shell.html').read_text()+'<script>\n'+js+'\n</script></body></html>\n'
(p/'app/src/main/assets/index.html').write_text(s);print(len(s)//1024,'KB')

import pathlib
p=pathlib.Path(__file__).parent
s=(p/'src/shell.html').read_text()+'<script>\n'+(p/'src/game.js').read_text()+'\n</script></body></html>\n'
(p/'app/src/main/assets/index.html').write_text(s);print(len(s)//1024,'KB')

from pathlib import Path
p=Path('tests/combat-hub-regression.mjs')
s=p.read_text()
repls={
"has(/'メイン',6\\.8,new Color\\(S\\.accent\\),'bold'/, 'Japanese main label missing');":"has(/'メイン',MEDIUM_UI\\.mainLabel,new Color\\(S\\.accent\\),'bold'/, 'Japanese main label missing');",
"has(/'VS',15\\.2,new Color\\(S\\.accent\\),'black'/, 'Main VS emphasis regressed');":"has(/'VS',MEDIUM_UI\\.vs,new Color\\(S\\.accent\\),'black'/, 'Main VS emphasis regressed');",
"has(/aBox\\.size=new Size\\(140,36\\)/, 'Left main fighter box lost fixed height');":"has(/aBox\\.size=new Size\\(132,40\\)/, 'Left Medium fighter box geometry regressed');",
"has(/centerBox\\.size=new Size\\(44,36\\)/, 'Main center column lost fixed height');":"has(/centerBox\\.size=new Size\\(44,40\\)/, 'Medium center column geometry regressed');",
"has(/bBox\\.size=new Size\\(140,36\\)/, 'Right main fighter box lost fixed height');":"has(/bBox\\.size=new Size\\(132,40\\)/, 'Right Medium fighter box geometry regressed');",
"has(/aBox\\.addSpacer\\(\\);renderMainName\\(aBox,ctx\\.a\\.name\\);aBox\\.addSpacer\\(\\)/, 'Left main fighter is not vertically centered');":"has(/aBox\\.addSpacer\\(\\);renderMediumMainName\\(aBox,ctx\\.a\\.name\\);aBox\\.addSpacer\\(\\)/, 'Left Medium fighter is not vertically centered');",
"has(/bBox\\.addSpacer\\(\\);renderMainName\\(bBox,ctx\\.b\\.name\\);bBox\\.addSpacer\\(\\)/, 'Right main fighter is not vertically centered');":"has(/bBox\\.addSpacer\\(\\);renderMediumMainName\\(bBox,ctx\\.b\\.name\\);bBox\\.addSpacer\\(\\)/, 'Right Medium fighter is not vertically centered');",
"has(/function renderMainName\\(box,name\\)\\{[^}]*t\\.centerAlignText\\(\\)/, 'Main fighter text is not horizontally centered');":"has(/function renderMediumMainName\\(box,name\\)\\{[^}]*t\\.centerAlignText\\(\\)/, 'Medium fighter text is not horizontally centered');",
}
for old,new in repls.items():
    if old not in s:
        raise SystemExit('missing core regression target: '+old[:70])
    s=s.replace(old,new,1)
p.write_text(s)

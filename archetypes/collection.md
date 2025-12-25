+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = '{{ .Date }}'
draft = true
description = ''

[album]
artist = ''
releaseYear = {{ now.Year }}
label = ''
catalogNumber = ''
genres = []

[album.links]
spotify = ''
bandcamp = ''
appleMusic = ''

[[album.tracklist]]
side = "Side A"
tracks = []

[[album.tracklist]]
side = "Side B"
tracks = []

[[album.credits]]
section = "Band Members"
people = []
+++

Album description goes here...

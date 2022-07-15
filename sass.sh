for i in $(find $pwd -wholename './src/*.s[ac]ss'); do
	node-sass -i $i > ${i%s[ac]ss}css;
done;

require 'rubygems'
require 'closure-compiler'

outputFilePath = ARGV[0]

def write(path, text)
  outputFile = File.new(path, "w")
  outputFile.write(text)
  outputFile.close
end

def build(outputPath, files) 
  # concatenate the files for output.js
  concat = ""
  files.each do |path|
    File.open(path, 'r').each do |line|
      concat += line
    end
  end
  write(outputPath, concat)
  
  # use simple closure compilation for output.min.js
  
  compiled = ""
  closure = Closure::Compiler.new()
  files.each do |path|
    compiled += closure.compile(File.open(path, 'r'));
  end
  
  minPath = outputPath.match /(.*)(\..*)/
  minPath = minPath[1] + ".min" + minPath[2]
  write(minPath, compiled)
end

build(outputFilePath, [
  "lib/Basic.js",
  "lib/EventPublisher.js",
  "lib/Communicator.js",
  "lib/Host.js",
  "lib/Client.js"
])

puts "successfully built #{outputFilePath} + .min version!"

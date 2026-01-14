namespace :profiles do
  desc "Attach multiple images to a profile for testing"
  task :attach_images, [:profile_id] => :environment do |t, args|
    profile_id = args[:profile_id] || 4
    profile = Profile.find_by(id: profile_id)
    
    unless profile
      puts "Profile with ID #{profile_id} not found!"
      exit
    end
    
    # Path to images in frontend/public/images
    # Adjust this path based on your project structure
    images_dir = Rails.root.join('..', 'frontend', 'public', 'images')
    
    # List of images to attach (using some of the available images)
    image_files = [
      'image1.jpg',
      'image2.jpg',
      'image3.jpg',
      'image4.avif',
      'image5.avif',
      'image6.avif'
    ]
    
    puts "Attaching images to profile #{profile_id} (#{profile.full_name})..."
    
    image_files.each_with_index do |image_file, index|
      image_path = images_dir.join(image_file)
      
      if File.exist?(image_path)
        begin
          file = File.open(image_path)
          profile.photos.attach(
            io: file,
            filename: image_file,
            content_type: image_file.ends_with?('.avif') ? 'image/avif' : 'image/jpeg'
          )
          puts "  ✓ Attached #{image_file}"
        rescue => e
          puts "  ✗ Failed to attach #{image_file}: #{e.message}"
        ensure
          file.close if file
        end
      else
        puts "  ✗ Image not found: #{image_path}"
      end
    end
    
    puts "\nDone! Profile #{profile_id} now has #{profile.photos.count} photos attached."
  end
end


# Clear existing data
puts "Clearing existing data..."
User.destroy_all

# Sample data arrays
male_first_names = [
  'Raj', 'Amit', 'Rahul', 'Vikram', 'Arjun', 'Karan', 'Siddharth', 'Aditya', 'Rohan', 'Kunal',
  'Ankit', 'Prateek', 'Nikhil', 'Saurabh', 'Vishal', 'Manish', 'Deepak', 'Gaurav', 'Abhishek', 'Ravi',
  'Suresh', 'Mahesh', 'Naresh', 'Dinesh', 'Pankaj', 'Yash', 'Harsh', 'Mohit', 'Akash', 'Varun',
  'Rishabh', 'Shubham', 'Anuj', 'Krishna', 'Shivam', 'Ayush', 'Piyush', 'Ritik', 'Sahil', 'Vivek',
  'Tarun', 'Nitin', 'Jatin', 'Chirag', 'Ritesh', 'Sagar', 'Vikash', 'Sunil', 'Aman', 'Rishav'
]

female_first_names = [
  'Priya', 'Anjali', 'Kavya', 'Sneha', 'Divya', 'Riya', 'Pooja', 'Neha', 'Shreya', 'Aishwarya',
  'Isha', 'Meera', 'Radha', 'Kriti', 'Ananya', 'Aditi', 'Sanjana', 'Tanvi', 'Sakshi', 'Nisha',
  'Riya', 'Kiran', 'Jyoti', 'Deepika', 'Sonali', 'Ritika', 'Swati', 'Manisha', 'Kavita', 'Sunita',
  'Rekha', 'Pallavi', 'Shilpa', 'Rashmi', 'Vidya', 'Madhuri', 'Sushmita', 'Kajal', 'Rakhi', 'Preeti',
  'Sapna', 'Ritu', 'Monika', 'Anita', 'Suman', 'Lata', 'Geeta', 'Sarita', 'Kamala', 'Lakshmi'
]

last_names = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Yadav', 'Jain', 'Agarwal', 'Reddy',
  'Mehta', 'Malhotra', 'Kapoor', 'Chopra', 'Bansal', 'Goyal', 'Arora', 'Saxena', 'Tiwari', 'Mishra',
  'Joshi', 'Shah', 'Pandey', 'Nair', 'Rao', 'Iyer', 'Menon', 'Narayan', 'Krishnan', 'Raman'
]

cities = [
  ['Mumbai', 'Maharashtra'], ['Delhi', 'Delhi'], ['Bangalore', 'Karnataka'], ['Hyderabad', 'Telangana'],
  ['Chennai', 'Tamil Nadu'], ['Kolkata', 'West Bengal'], ['Pune', 'Maharashtra'], ['Ahmedabad', 'Gujarat'],
  ['Jaipur', 'Rajasthan'], ['Surat', 'Gujarat'], ['Lucknow', 'Uttar Pradesh'], ['Kanpur', 'Uttar Pradesh'],
  ['Nagpur', 'Maharashtra'], ['Indore', 'Madhya Pradesh'], ['Thane', 'Maharashtra'], ['Bhopal', 'Madhya Pradesh'],
  ['Visakhapatnam', 'Andhra Pradesh'], ['Patna', 'Bihar'], ['Vadodara', 'Gujarat'], ['Ghaziabad', 'Uttar Pradesh'],
  ['Ludhiana', 'Punjab'], ['Agra', 'Uttar Pradesh'], ['Nashik', 'Maharashtra'], ['Faridabad', 'Haryana'],
  ['Meerut', 'Uttar Pradesh'], ['Rajkot', 'Gujarat'], ['Varanasi', 'Uttar Pradesh'], ['Srinagar', 'Jammu and Kashmir'],
  ['Amritsar', 'Punjab'], ['Chandigarh', 'Chandigarh']
]

religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain']
castes = {
  'Hindu' => ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Rajput', 'Maratha', 'Gujar', 'Jat'],
  'Muslim' => ['Sunni', 'Shia', 'Sufi'],
  'Christian' => ['Catholic', 'Protestant', 'Orthodox'],
  'Sikh' => ['Jat Sikh', 'Khatri', 'Arora'],
  'Buddhist' => ['Theravada', 'Mahayana'],
  'Jain' => ['Digambar', 'Shwetambar']
}

education_levels = [
  'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'MBA', 'PhD',
  'Engineering Degree', 'Medical Degree', 'Law Degree', 'CA', 'CS', 'ICWA'
]

professions = [
  'Software Engineer', 'Doctor', 'Teacher', 'Engineer', 'Business Analyst', 'Manager',
  'Accountant', 'Lawyer', 'Architect', 'Designer', 'Marketing Executive', 'Sales Manager',
  'Consultant', 'Entrepreneur', 'Banker', 'CA', 'Professor', 'Nurse', 'Pharmacist',
  'Data Scientist', 'Product Manager', 'HR Manager', 'Operations Manager', 'Financial Analyst'
]

marital_statuses = ['never_married', 'divorced', 'widowed']
diets = ['vegetarian', 'non_vegetarian', 'vegan', 'jain']
drinking_options = ['no', 'occasionally', 'yes']
smoking_options = ['no', 'occasionally', 'yes']

# Helper method to generate random date of birth (age between 22-45)
def random_date_of_birth(min_age: 22, max_age: 45)
  age = rand(min_age..max_age)
  Date.today - age.years - rand(0..365).days
end

# Helper method to generate random height in cm
def random_height(gender)
  if gender == 'male'
    rand(165..185) # 165-185 cm for males
  else
    rand(150..170) # 150-170 cm for females
  end
end

# Helper method to generate annual income
def random_annual_income
  rand(300000..2000000) # 3L to 20L
end

puts "Creating 50 male users..."
50.times do |i|
  user = User.create!(
    email: "male.user#{i + 1}@example.com",
    password: "password123",
    password_confirmation: "password123",
    role: :user,
    email_verified: :verified,
    email_verified_at: Time.current
  )

  first_name = male_first_names.sample
  last_name = last_names.sample
  city, state = cities.sample
  religion = religions.sample
  caste = castes[religion].sample
  date_of_birth = random_date_of_birth

  profile = user.create_profile!(
    first_name: first_name,
    last_name: last_name,
    date_of_birth: date_of_birth,
    gender: 'male',
    height: random_height('male'),
    religion: religion,
    caste: caste,
    sub_caste: nil,
    marital_status: marital_statuses.sample,
    diet: diets.sample,
    drinking: drinking_options.sample,
    smoking: smoking_options.sample,
    education: education_levels.sample,
    profession: professions.sample,
    annual_income: random_annual_income,
    city: city,
    state: state,
    country: 'India',
    about_me: "I am a #{professions.sample} based in #{city}. I enjoy reading, traveling, and spending time with family. Looking for a life partner who shares similar values and interests.",
    family_details: "I come from a middle-class family. My father is a #{professions.sample} and my mother is a homemaker.",
    father_name: "#{last_names.sample} #{first_name}",
    mother_name: "#{last_names.sample} #{female_first_names.sample}",
    siblings: rand(0..2) == 0 ? 'Only child' : "#{rand(1..2)} #{['brother', 'sister'].sample}",
    native_place: cities.sample[0],
    languages_spoken: ['Hindi', 'English', ['Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi'].sample].join(', ')
  )

  # Create partner preferences
  user.create_partner_preference!(
    min_age: rand(22..28),
    max_age: rand(32..40),
    min_height: rand(150..160),
    max_height: rand(170..180),
    religion: religion,
    caste: caste,
    education: education_levels.sample,
    profession: professions.sample,
    city: city,
    state: state,
    marital_status: 'never_married'
  )
end

puts "Creating 50 female users..."
50.times do |i|
  user = User.create!(
    email: "female.user#{i + 1}@example.com",
    password: "password123",
    password_confirmation: "password123",
    role: :user,
    email_verified: :verified,
    email_verified_at: Time.current
  )

  first_name = female_first_names.sample
  last_name = last_names.sample
  city, state = cities.sample
  religion = religions.sample
  caste = castes[religion].sample
  date_of_birth = random_date_of_birth

  profile = user.create_profile!(
    first_name: first_name,
    last_name: last_name,
    date_of_birth: date_of_birth,
    gender: 'female',
    height: random_height('female'),
    religion: religion,
    caste: caste,
    sub_caste: nil,
    marital_status: marital_statuses.sample,
    diet: diets.sample,
    drinking: drinking_options.sample,
    smoking: smoking_options.sample,
    education: education_levels.sample,
    profession: professions.sample,
    annual_income: random_annual_income,
    city: city,
    state: state,
    country: 'India',
    about_me: "I am a #{professions.sample} based in #{city}. I love cooking, music, and art. Looking for a caring and understanding life partner who values family and relationships.",
    family_details: "I come from a loving family. My father works as a #{professions.sample} and my mother is a #{professions.sample}.",
    father_name: "#{last_names.sample} #{male_first_names.sample}",
    mother_name: "#{last_names.sample} #{female_first_names.sample}",
    siblings: rand(0..2) == 0 ? 'Only child' : "#{rand(1..2)} #{['brother', 'sister'].sample}",
    native_place: cities.sample[0],
    languages_spoken: ['Hindi', 'English', ['Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi'].sample].join(', ')
  )

  # Create partner preferences
  user.create_partner_preference!(
    min_age: rand(25..30),
    max_age: rand(35..42),
    min_height: rand(165..175),
    max_height: rand(180..190),
    religion: religion,
    caste: caste,
    education: education_levels.sample,
    profession: professions.sample,
    city: city,
    state: state,
    marital_status: 'never_married'
  )
end

puts "Seed data created successfully!"
puts "Total users: #{User.count}"
puts "Total profiles: #{Profile.count}"
puts "Total partner preferences: #{PartnerPreference.count}"


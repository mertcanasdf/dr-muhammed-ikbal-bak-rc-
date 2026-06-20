import os
import re
import json
import sys

def publish_article(article_data):
    base_dir = r"c:\Users\mertc\OneDrive\Desktop\muhammed hocam\dr.muhammed ikbal bakırcı"
    blog_dir = os.path.join(base_dir, "blog")
    pages_dir = os.path.join(base_dir, "pages")
    
    title = article_data["title"]
    slug = article_data["slug"]
    category = article_data["category"]
    tag = article_data["tag"]
    date = article_data["date"]
    read_time = article_data["read_time"]
    excerpt = article_data["excerpt"]
    content_html = article_data["content_html"]
    image_name = article_data.get("image_name", "cellular-science.png")
    toc = article_data.get("toc", [])
    
    # 1. Create the new blog detail page: blog/{slug}.html
    template_path = os.path.join(blog_dir, "otofaji-nedir.html")
    if not os.path.exists(template_path):
        print(f"Error: Template blog file not found at {template_path}")
        return False
        
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()
        
    # Replace title in <title>
    title_pattern = r"<title>.*?</title>"
    new_title_tag = f"<title>{title} — Dr. Muhammed İkbal Bakırcı</title>"
    template = re.sub(title_pattern, new_title_tag, template)
    
    # Replace article hero content
    hero_pattern = r'(<section class="article-hero">.*?<span class="article-hero__cat">).*?(</span>.*?<h1 class="article-hero__title">).*?(</h1>.*?<div class="article-hero__meta">.*?<span>Dr\. Muhammed İkbal Bakırcı</span>.*?<span>).*?(</span>.*?<span>).*?(</span>)'
    # Since regex substitution can be tricky with complex groups, let's use a simpler marker replacement
    
    # Find the article-hero section and replace inner block
    hero_start = template.find('<section class="article-hero">')
    hero_end = template.find('</section>', hero_start) + len('</section>')
    
    new_hero = f"""<section class="article-hero">
      <div class="container">
        <div class="article-hero__inner">
          <span class="article-hero__cat">{category}</span>
          <h1 class="article-hero__title">{title}</h1>
          <div class="article-hero__meta">
            <span>Dr. Muhammed İkbal Bakırcı</span>
            <span>{date}</span>
            <span>{read_time}</span>
          </div>
        </div>
      </div>
    </section>"""
    
    template = template[:hero_start] + new_hero + template[hero_end:]
    
    # Update Featured Image
    img_pattern = r'(<article class="article-body">.*?<img src=").*?(" alt=").*?(" class="article-body__featured-img" />)'
    # Replace the featured image in article body
    article_body_start = template.find('<article class="article-body">')
    img_tag_start = template.find('<img ', article_body_start)
    img_tag_end = template.find('/>', img_tag_start) + 2
    
    new_img_tag = f'<img src="../assets/images/generated/topics/{image_name}" alt="{title}" class="article-body__featured-img" />'
    template = template[:img_tag_start] + new_img_tag + template[img_tag_end:]
    
    # Replace main content inside article-body
    # We want to replace everything from the end of the featured image to the <div class="author-bio">
    author_bio_start = template.find('<div class="author-bio">')
        
    # Re-fetch article_body_start and img_tag_end as the string length changed
    article_body_start = template.find('<article class="article-body">')
    img_tag_start = template.find('<img ', article_body_start)
    img_tag_end = template.find('/>', img_tag_start) + 2
    
    # The content area is between img_tag_end and author_bio_start
    template = template[:img_tag_end] + "\n\n" + content_html + "\n\n          " + template[author_bio_start:]
    
    # Update Table of Contents (TOC)
    toc_start = template.find('<div class="sidebar-card sidebar-toc">')
    toc_end = template.find('</div>', toc_start) + len('</div>')
    
    new_toc_links = ""
    for item in toc:
        new_toc_links += f'\n            <a href="#{item["id"]}">{item["title"]}</a>'
        
    new_toc_card = f"""<div class="sidebar-card sidebar-toc">
            <p class="sidebar-card__title">İçindekiler</p>{new_toc_links}
          </div>"""
          
    template = template[:toc_start] + new_toc_card + template[toc_end:]
    
    # Write the completed article file
    new_article_path = os.path.join(blog_dir, f"{slug}.html")
    with open(new_article_path, "w", encoding="utf-8") as f:
        f.write(template)
    print(f"Created article: {new_article_path}")
    
    # 2. Inject into blog/index.html
    blog_index_path = os.path.join(blog_dir, "index.html")
    if os.path.exists(blog_index_path):
        with open(blog_index_path, "r", encoding="utf-8") as f:
            blog_index = f.read()
            
        grid_start = blog_index.find('<div class="blog-grid" id="blogGrid">')
        insert_pos = blog_index.find('>', grid_start) + 1
        
        new_blog_card = f"""
          <article class="blog-card" data-cat="{category}">
            <a href="{slug}.html">
              <img src="../assets/images/generated/topics/{image_name}" alt="{title}" class="blog-card__img" />
            </a>
            <div class="blog-card__body">
              <span class="blog-card__cat">{category}</span>
              <h2 class="blog-card__title"><a href="{slug}.html">{title}</a></h2>
              <p class="blog-card__excerpt">{excerpt}</p>
              <div class="blog-card__meta">
                <span>{date}</span>
                <span>{read_time}</span>
              </div>
              <a href="{slug}.html" class="blog-card__read-more">Devamını oku &rarr;</a>
            </div>
          </article>
"""
        blog_index = blog_index[:insert_pos] + new_blog_card + blog_index[insert_pos:]
        with open(blog_index_path, "w", encoding="utf-8") as f:
            f.write(blog_index)
        print("Updated blog/index.html with new card")
        
    # 3. Inject into pages/dunyada-saglik.html
    ds_path = os.path.join(pages_dir, "dunyada-saglik.html")
    if os.path.exists(ds_path):
        with open(ds_path, "r", encoding="utf-8") as f:
            ds_content = f.read()
            
        grid_start = ds_content.find('<div class="recipe-grid">')
        insert_pos = ds_content.find('>', grid_start) + 1
        
        new_ds_card = f"""
        <div class="recipe-card">
          <a href="../blog/{slug}.html">
            <img src="../assets/images/generated/topics/{image_name}" alt="{title}" class="recipe-card__img" />
          </a>
          <div class="recipe-card__body">
            <span class="recipe-card__tag">{tag}</span>
            <h3 class="recipe-card__title"><a href="../blog/{slug}.html" style="color: inherit; text-decoration: none;">{title}</a></h3>
            <div class="recipe-card__meta">
              <span>⏱ {read_time}</span>
              <span>🔥 {category}</span>
            </div>
          </div>
        </div>
"""
        ds_content = ds_content[:insert_pos] + new_ds_card + ds_content[insert_pos:]
        with open(ds_path, "w", encoding="utf-8") as f:
            f.write(ds_content)
        print("Updated pages/dunyada-saglik.html with new card")
        
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Load from JSON file argument
        json_path = sys.argv[1]
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        publish_article(data)
    else:
        # Read from stdin
        data = json.load(sys.stdin)
        publish_article(data)

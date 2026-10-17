const generateResumeMarkdown = (data) => {
  const {
    name = 'Candidate Name',
    headline = 'Full Stack Developer',
    email = '',
    phone = '',
    location = '',
    linkedin = '',
    github = '',
    website = '',
    about = '',
    education = [],
    experience = [],
    projects = [],
    skills = [],
    certifications = [],
    template = 'modern',
  } = data;

  const contactItems = [
    email && `Email: ${email}`,
    phone && `Phone: ${phone}`,
    location && `Location: ${location}`,
    linkedin && `LinkedIn: ${linkedin}`,
    github && `GitHub: ${github}`,
    website && `Portfolio: ${website}`,
  ]
    .filter(Boolean)
    .join(' | ');

  let md = `# ${name.toUpperCase()}\n`;
  md += `### ${headline}\n`;
  if (contactItems) md += `${contactItems}\n\n---\n\n`;

  if (about) {
    md += `## PROFESSIONAL SUMMARY\n${about}\n\n`;
  }

  if (skills && skills.length > 0) {
    const skillsList = Array.isArray(skills) ? skills.join(', ') : skills;
    md += `## TECHNICAL & CORE SKILLS\n${skillsList}\n\n`;
  }

  if (experience && experience.length > 0) {
    md += `## WORK EXPERIENCE\n`;
    experience.forEach((exp) => {
      const dates = exp.isCurrent
        ? `${exp.startDate || ''} - Present`
        : `${exp.startDate || ''} - ${exp.endDate || ''}`;
      md += `### **${exp.title}** - ${exp.company} (${dates})\n`;
      if (exp.location) md += `*Location: ${exp.location}*\n`;
      if (exp.responsibilities) md += `- ${exp.responsibilities}\n`;
      if (exp.achievements) md += `- Key Achievement: ${exp.achievements}\n`;
      if (exp.skills && exp.skills.length > 0) {
        md += `- Technologies: ${Array.isArray(exp.skills) ? exp.skills.join(', ') : exp.skills}\n`;
      }
      md += `\n`;
    });
  }

  if (projects && projects.length > 0) {
    md += `## PROJECTS\n`;
    projects.forEach((proj) => {
      const tech = proj.techStack
        ? ` | *Tech Stack: ${Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}*`
        : '';
      md += `### **${proj.title}**${tech}\n`;
      if (proj.description) md += `- ${proj.description}\n`;
      if (proj.liveUrl) md += `- Live Demo: ${proj.liveUrl}\n`;
      if (proj.repoUrl) md += `- Source Code: ${proj.repoUrl}\n`;
      md += `\n`;
    });
  }

  if (education && education.length > 0) {
    md += `## EDUCATION\n`;
    education.forEach((edu) => {
      const years =
        edu.startYear && edu.endYear ? ` (${edu.startYear} - ${edu.endYear})` : '';
      md += `### **${edu.degree || 'B.Tech'} - ${edu.branch || 'Engineering'}**${years}\n`;
      md += `${edu.institute}${edu.location ? `, ${edu.location}` : ''}\n`;
      if (edu.achievements) md += `- Honors/Achievements: ${edu.achievements}\n`;
      md += `\n`;
    });
  }

  if (certifications && certifications.length > 0) {
    md += `## CERTIFICATIONS\n`;
    certifications.forEach((cert) => {
      md += `- **${cert.name}** (${cert.issuer || 'Issuing Authority'}${cert.year ? ` - ${cert.year}` : ''})\n`;
    });
    md += `\n`;
  }

  return md;
};

const enhanceSectionText = ({ sectionType, text, context = '' }) => {
  if (!text || !text.trim()) {
    return 'Please provide text to enhance.';
  }

  const clean = text.trim();

  if (sectionType === 'summary') {
    return `Results-driven ${context || 'professional'} skilled in collaborating with cross-functional teams to deliver scalable solutions. ${clean}`;
  }

  if (sectionType === 'project') {
    return `Spearheaded design and implementation: ${clean}. Optimized performance and ensured responsive, accessible architecture.`;
  }

  if (sectionType === 'experience') {
    return `Executed core responsibilities with high impact: ${clean}. Delivered deliverables within schedule while maintaining quality standards.`;
  }

  return `Enhanced: ${clean}`;
};

const generatePortfolioHTML = (data) => {
  const {
    name = 'My Portfolio',
    headline = 'Full Stack Developer',
    about = 'Building modern digital experiences.',
    skills = [],
    projects = [],
    email = '',
    github = '',
    linkedin = '',
  } = data;

  const skillsHTML = (Array.isArray(skills) ? skills : [skills])
    .map(
      (s) =>
        `<span style="background: rgba(34,211,238,0.1); color: #22d3ee; border: 1px solid rgba(34,211,238,0.3); padding: 6px 14px; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">${s}</span>`
    )
    .join(' ');

  const projectsHTML = (projects || [])
    .map(
      (p) => `
      <div style="background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 16px; margin-bottom: 20px;">
        <h3 style="color: #38bdf8; margin-top: 0;">${p.title}</h3>
        <p style="color: #cbd5e1; line-height: 1.6;">${p.description || ''}</p>
        ${
          p.techStack
            ? `<p style="color: #94a3b8; font-size: 0.85rem;"><strong>Tech:</strong> ${Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}</p>`
            : ''
        }
        ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" style="color: #22d3ee; text-decoration: none; font-weight: bold; margin-right: 16px;">Live Demo ↗</a>` : ''}
        ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" style="color: #94a3b8; text-decoration: none;">GitHub ↗</a>` : ''}
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Portfolio</title>
  <style>
    * { box-sizing: border-box; }
    body { background-color: #0b1120; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 50px; }
    h1 { font-size: 2.75rem; margin-bottom: 8px; color: #f8fafc; }
    .headline { color: #38bdf8; font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; }
    .about { color: #94a3b8; max-width: 650px; margin: 0 auto 24px auto; line-height: 1.6; }
    .skills-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 50px; }
    h2 { border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-top: 40px; color: #e2e8f0; }
    footer { text-align: center; margin-top: 60px; color: #64748b; font-size: 0.875rem; border-top: 1px solid #1e293b; padding-top: 30px; }
    a.btn { display: inline-block; background: #22d3ee; color: #0b1120; padding: 12px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${name}</h1>
      <div class="headline">${headline}</div>
      <p class="about">${about}</p>
      ${email ? `<a class="btn" href="mailto:${email}">Get in Touch</a>` : ''}
    </header>

    ${skillsHTML ? `<h2>Technical Skills</h2><div class="skills-container">${skillsHTML}</div>` : ''}

    ${projectsHTML ? `<h2>Featured Projects</h2><div>${projectsHTML}</div>` : ''}

    <footer>
      <p>Built with CareerBridge Portfolio Studio</p>
      ${linkedin ? `<a href="${linkedin}" style="color:#38bdf8; margin: 0 10px;">LinkedIn</a>` : ''}
      ${github ? `<a href="${github}" style="color:#38bdf8; margin: 0 10px;">GitHub</a>` : ''}
    </footer>
  </div>
</body>
</html>`;
};

module.exports = {
  generateResumeMarkdown,
  enhanceSectionText,
  generatePortfolioHTML,
};

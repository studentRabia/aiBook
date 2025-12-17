import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import TranslateButton from '@site/src/components/TranslateButton';
import PersonalizeButton from '@site/src/components/PersonalizeButton';

/**
 * Title component - renders the doc title
 */
function DocItemTitle({children}) {
  return (
    <Heading as="h1" className={clsx('markdown', ThemeClassNames.docs.docTitle)}>
      {children}
    </Heading>
  );
}

export default function DocItemContent({children}) {
  const {metadata, contentTitle} = useDoc();
  const {frontMatter} = metadata;
  const shouldRenderTitle = !frontMatter.hide_title && contentTitle;

  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {/* AI Personalization Button - logged-in users only */}
      <PersonalizeButton />

      {/* Translate Button at the top of each chapter */}
      <TranslateButton />

      {shouldRenderTitle && <DocItemTitle>{contentTitle}</DocItemTitle>}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}

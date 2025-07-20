
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSections } from '@/hooks/useSections';
import { useCourseDetail } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import CreateSectionDialog from '@/components/CreateSectionDialog';

// Custom section node component
const SectionNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-w-[200px] shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="font-semibold text-sm font-lexend mb-2">{data.title}</h3>
      <p className="text-xs text-gray-600 font-lexend line-clamp-2">{data.description}</p>
      <p className="text-xs text-gray-500 font-lexend mt-2">by {data.createdBy}</p>
    </div>
  );
};

// Course title node component
const CourseTitleNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center shadow-lg">
      <h1 className="text-2xl font-bold font-lexend">{data.title}</h1>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  section: SectionNode,
  courseTitle: CourseTitleNode,
};

const CourseSections: React.FC = () => {
  const { spaceId, courseId } = useParams<{ spaceId: string; courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { sections, loading, fetchSections } = useSections(spaceId || '', courseId || '');
  const { course } = useCourseDetail(spaceId || '', courseId || '');

  // Check if user can add sections (Space Admin or System Admin)
  const canAddSections = user?.role === 'SystemAdmin' || user?.username === course?.CreatedBy;

  const handleSectionCreated = () => {
    fetchSections();
  };

  // Transform sections into nodes and edges for the roadmap
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add course title node at the top
    if (course) {
      nodes.push({
        id: 'course-title',
        type: 'courseTitle',
        position: { x: 0, y: 0 },
        data: { title: course.CourseTitle },
        draggable: false,
      });
    }

    // Add section nodes in a vertical flow layout
    sections.forEach((section, index) => {
      const nodeId = section.SectionId;
      
      nodes.push({
        id: nodeId,
        type: 'section',
        position: { 
          x: (index % 3) * 300 - 300, // 3 columns layout, centered
          y: Math.floor(index / 3) * 150 + 150 // Row spacing
        },
        data: {
          title: section.SectionTitle,
          description: section.Description,
          createdBy: section.CreatedBy,
          sectionId: section.SectionId,
        },
        draggable: false,
      });

      // Connect course title to first section, and sections to each other
      if (index === 0 && course) {
        edges.push({
          id: `course-to-${nodeId}`,
          source: 'course-title',
          target: nodeId,
          type: 'smoothstep',
          animated: true,
        });
      } else if (index > 0) {
        const prevSectionId = sections[index - 1].SectionId;
        edges.push({
          id: `${prevSectionId}-to-${nodeId}`,
          source: prevSectionId,
          target: nodeId,
          type: 'smoothstep',
        });
      }
    });

    return { nodes, edges };
  }, [sections, course]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when sections change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'section') {
      navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${node.data.sectionId}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}`)}
          className="font-lexend"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        
        {canAddSections && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="font-lexend"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        )}
      </div>

      {/* Roadmap Visualization */}
      {sections.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 font-lexend mb-2">No sections yet</h3>
          <p className="text-gray-600 font-lexend mb-4">
            {canAddSections 
              ? "Get started by creating your first section to see the roadmap." 
              : "Sections will appear in the roadmap once they're added."}
          </p>
          {canAddSections && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="font-lexend"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          )}
        </div>
      ) : (
        <div className="h-[600px] border rounded-lg bg-gray-50/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ background: 'transparent' }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Controls />
            <Background color="#e5e7eb" gap={20} />
          </ReactFlow>
        </div>
      )}

      <CreateSectionDialog
        spaceId={spaceId || ''}
        courseId={courseId || ''}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
};

export default CourseSections;

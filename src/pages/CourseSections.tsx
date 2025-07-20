
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
  NodeTypes,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSections } from '@/hooks/useSections';
import { useCourseDetail } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import CreateSectionDialog from '@/components/CreateSectionDialog';

// Custom section node component
const SectionNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white border-2 border-primary/20 rounded-lg p-4 min-w-[220px] max-w-[220px] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/40">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        <h3 className="font-semibold text-sm font-lexend">{data.title}</h3>
      </div>
      <p className="text-xs text-gray-600 font-lexend line-clamp-2 mb-2">{data.description}</p>
      <p className="text-xs text-gray-500 font-lexend">by {data.createdBy}</p>
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

    // Add course title node at the top center
    if (course) {
      nodes.push({
        id: 'course-title',
        type: 'courseTitle',
        position: { x: 0, y: 0 },
        data: { title: course.CourseTitle },
        draggable: false,
      });
    }

    // Create a zigzag pattern for better roadmap visualization
    sections.forEach((section, index) => {
      const nodeId = section.SectionId;
      
      // Zigzag pattern: alternate left and right
      const isEven = index % 2 === 0;
      const xOffset = isEven ? -200 : 200;
      const yPosition = (index + 1) * 200 + 150; // Start after course title
      
      nodes.push({
        id: nodeId,
        type: 'section',
        position: { 
          x: xOffset,
          y: yPosition
        },
        data: {
          title: section.SectionTitle,
          description: section.Description,
          createdBy: section.CreatedBy,
          sectionId: section.SectionId,
        },
        draggable: false,
      });

      // Create sequential connections
      if (index === 0 && course) {
        // Connect course title to first section
        edges.push({
          id: `course-to-${nodeId}`,
          source: 'course-title',
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        });
      } else if (index > 0) {
        // Connect each section to the next one in sequence
        const prevSectionId = sections[index - 1].SectionId;
        edges.push({
          id: `${prevSectionId}-to-${nodeId}`,
          source: prevSectionId,
          target: nodeId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
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
        <div className="h-[700px] border rounded-lg bg-gradient-to-b from-blue-50/30 to-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15, includeHiddenNodes: false }}
            style={{ background: 'transparent' }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#3b82f6', strokeWidth: 3 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            }}
          >
            <Controls showInteractive={false} />
            <Background color="#e2e8f0" gap={25} size={1} />
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
